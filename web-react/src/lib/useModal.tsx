import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { defaults, merge } from 'lodash-es';
import { Modal } from './components/Modal';
import { SaveChangesModal } from './components/SaveChangesModal';
import { WidgetSettingsModal } from './components/WidgetSettingsModal';
import type { DashboardOptions, WidgetDefinition, WidgetModelLike } from './models/types';
import { logger } from './logger';
import type { DashboardEvents } from './events';

export const WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL = 'app/template/WidgetSpecificSettings.html';
export const SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL = 'template/SaveChangesModal.html';

export type ModalResolve = Record<string, unknown>;
export type ModalOpenOptions = {
  templateUrl?: string;
  controller?: string;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  size?: string;
  windowClass?: string;
  resolve?: ModalResolve;
  scope?: Record<string, unknown>;
};
export type ModalInstance = {
  result: Promise<unknown>;
  close: (value?: unknown) => void;
  dismiss: (reason?: unknown) => void;
};
export type ModalContentProps = {
  resolve: ModalResolve;
  scope: Record<string, unknown>;
  close: (value?: unknown) => void;
  dismiss: (reason?: unknown) => void;
  partials?: WidgetSettingsPartialRegistry;
};
export type ModalRegistry = Record<string, ComponentType<ModalContentProps>>;
export type WidgetSettingsPartialRegistry = Record<string, ComponentType<{
  widget: WidgetModelLike;
  result: WidgetDefinition;
  updateResult: (mutate: (draft: WidgetDefinition) => void) => void;
}>>;

type ModalEntry = {
  id: number;
  options: ModalOpenOptions;
  Component: ComponentType<ModalContentProps>;
  instance: ModalInstance;
};

type ModalContextValue = {
  open: (options: ModalOpenOptions) => ModalInstance;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);
const EMPTY_REGISTRY: ModalRegistry = {};
const EMPTY_PARTIALS: WidgetSettingsPartialRegistry = {};

const builtInRegistry: ModalRegistry = {
  'components/directives/dashboard/widget-settings-template.html': WidgetSettingsModal,
  'components/directives/dashboardLayouts/SaveChangesModal.html': SaveChangesModal,
};

function missingModal(key: string, reject: (reason: unknown) => void): void {
  logger.warn(`Unable to resolve modal content: ${key}`);
  queueMicrotask(() => reject(new Error(`Unable to resolve modal content: ${key}`)));
}

export function ModalProvider({
  registry = EMPTY_REGISTRY,
  partials = EMPTY_PARTIALS,
  children,
}: {
  registry?: ModalRegistry;
  partials?: WidgetSettingsPartialRegistry;
  children?: ReactNode;
}): JSX.Element {
  const [entries, setEntries] = useState<ModalEntry[]>([]);
  const mergedRegistry = useMemo(() => ({ ...builtInRegistry, ...registry }), [registry]);
  useEffect(() => {
    document.body.classList.toggle('modal-open', entries.length > 0);
    return () => document.body.classList.remove('modal-open');
  }, [entries.length]);
  const open = useCallback((options: ModalOpenOptions): ModalInstance => {
    let settled = false;
    let resolveResult: (value: unknown) => void = () => undefined;
    let rejectResult: (reason: unknown) => void = () => undefined;
    const result = new Promise<unknown>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    result.catch(() => undefined);
    const instance: ModalInstance = {
      result,
      close: (value?: unknown) => {
        if (settled) return;
        settled = true;
        setEntries((current) => current.filter((entry) => entry.instance !== instance));
        resolveResult(value);
      },
      dismiss: (reason?: unknown) => {
        if (settled) return;
        settled = true;
        setEntries((current) => current.filter((entry) => entry.instance !== instance));
        rejectResult(reason);
      },
    };
    const key = options.templateUrl ?? options.controller ?? '';
    const Component = mergedRegistry[key];
    if (!Component) {
      missingModal(key, rejectResult);
      return instance;
    }
    const entry: ModalEntry = { id: Date.now() + Math.random(), options, Component, instance };
    setEntries((current) => [...current, entry]);
    return instance;
  }, [mergedRegistry]);

  return (
    <ModalContext.Provider value={{ open }}>
      {children}
      {entries.map((entry, index) => (
        <Modal
          key={entry.id}
          index={index}
          backdrop={entry.options.backdrop ?? true}
          keyboard={entry.options.keyboard ?? true}
          isTop={index === entries.length - 1}
          windowClass={entry.options.windowClass}
          size={entry.options.size}
          onDismiss={entry.instance.dismiss}
        >
          <entry.Component
            resolve={entry.options.resolve ?? {}}
            scope={entry.options.scope ?? {}}
            close={entry.instance.close}
            dismiss={entry.instance.dismiss}
            partials={partials}
          />
        </Modal>
      ))}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
}

function modalSettings(
  widget: WidgetModelLike,
  options: DashboardOptions,
): ModalOpenOptions {
  const settings = defaults(
    {},
    widget.settingsModalOptions ?? {},
    options.settingsModalOptions ?? {},
    { templateUrl: 'components/directives/dashboard/widget-settings-template.html', controller: 'WidgetSettingsCtrl' },
  ) as Partial<ModalOpenOptions>;
  return {
    templateUrl: settings.templateUrl,
    controller: settings.controller,
    backdrop: settings.backdrop,
    keyboard: settings.keyboard,
    size: settings.size,
    windowClass: settings.windowClass,
  };
}

export function useWidgetSettings(params: {
  options: DashboardOptions;
  scope?: Record<string, unknown>;
  events: DashboardEvents;
}): (widget: WidgetModelLike) => void {
  const { open } = useModal();
  const { options, scope = {}, events } = params;
  return useCallback((widget: WidgetModelLike): void => {
    const modal = open({
      ...modalSettings(widget, options),
      resolve: { widget },
      scope,
    });
    const onClose = widget.onSettingsClose ?? options.onSettingsClose ?? ((result: unknown) => merge(widget, result));
    const onDismiss = widget.onSettingsDismiss ?? options.onSettingsDismiss ?? ((reason: unknown) => logger.info('widget settings were dismissed. Reason: ', reason));
    modal.result.then(
      (result) => {
        onClose(result, widget, scope);
        events.emit('widgetChanged', widget);
      },
      (reason) => onDismiss(reason, scope),
    );
  }, [events, open, options, scope]);
}
