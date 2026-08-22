import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /** Exports rows as a .csv file — opens directly in Excel, no extra dependency required. */
  exportToCsv<T extends object>(filename: string, columns: ExportColumn[], rows: T[]) {
    const header = columns.map((c) => this.escapeCsvCell(c.header)).join(',');
    const body = rows
      .map((row) => columns.map((c) => this.escapeCsvCell(this.cellValue(row, c.key))).join(','))
      .join('\r\n');

    const csv = `${header}\r\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /** Exports rows as a .pdf table report. */
  exportToPdf<T extends object>(filename: string, title: string, columns: ExportColumn[], rows: T[]) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [columns.map((c) => c.header)],
      body: rows.map((row) => columns.map((c) => String(this.cellValue(row, c.key) ?? ''))),
    });

    doc.save(`${filename}.pdf`);
  }

  private cellValue(row: object, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  private escapeCsvCell(value: unknown): string {
    const str = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }

  /** Triggers a browser download for an already-built blob (e.g. a server-generated file). */
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
