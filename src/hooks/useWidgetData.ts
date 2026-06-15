import { useEffect, useRef, useState } from 'react';
import { WidgetDataModel } from '../models/WidgetDataModel';

/**
 * React hook that manages a WidgetDataModel lifecycle.
 * Calls init() on mount and destroy() on unmount.
 */
export function useWidgetData(
  DataModelClass: new () => WidgetDataModel,
  widget: { dataAttrName?: string; dataModelOptions?: Record<string, any> }
) {
  const [widgetData, setWidgetData] = useState<any>(undefined);
  const modelRef = useRef<WidgetDataModel | null>(null);

  useEffect(() => {
    const model = new DataModelClass();
    const scope = { widgetData: undefined };

    // Override updateScope to use React state
    model.updateScope = (data: any) => {
      setWidgetData(data);
    };

    model.setup(widget, scope);
    model.init();
    modelRef.current = model;

    return () => {
      model.destroy();
      modelRef.current = null;
    };
  }, [DataModelClass, widget]);

  return { widgetData, model: modelRef.current };
}
