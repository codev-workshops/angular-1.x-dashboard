import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sparkline-chart.html',
  styleUrl: './sparkline-chart.scss',
})
export class SparklineChartComponent implements AfterViewInit, OnChanges {
  @Input() data: number[] = [];
  @Input() color = '#10b981';
  @Input() width = 120;
  @Input() height = 40;

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['color']) && this.canvasRef) {
      this.drawChart();
    }
  }

  private drawChart(): void {
    if (!this.canvasRef || this.data.length < 2) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, this.width, this.height);

    // Sample data to reduce points for performance
    const sampled = this.sampleData(this.data, 30);
    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;
    const padding = 2;

    const stepX = (this.width - padding * 2) / (sampled.length - 1);

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.hexToRgba(this.color, 0.3));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0.0));

    ctx.beginPath();
    ctx.moveTo(padding, this.height);

    sampled.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (val - min) / range) * (this.height - padding * 2);
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(padding + (sampled.length - 1) * stepX, this.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    sampled.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (val - min) / range) * (this.height - padding * 2);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  private sampleData(data: number[], maxPoints: number): number[] {
    if (data.length <= maxPoints) return data;
    const step = Math.floor(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0).slice(0, maxPoints);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
