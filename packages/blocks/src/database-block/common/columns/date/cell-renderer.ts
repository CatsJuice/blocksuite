import { flip, offset } from '@floating-ui/dom';
import { baseTheme } from '@toeverything/theme';
import format from 'date-fns/format/index.js';
import { css, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import { DatePicker } from '../../../../components/date-picker/date-picker.js';
import { createIcon } from '../../../../components/icon/uni-icon.js';
import { createLitPortal } from '../../../../components/portal.js';
import { BaseCellRenderer } from '../base-cell.js';
import { columnRenderer, createFromBaseCellRenderer } from '../renderer.js';
import { datePureColumnConfig } from './define.js';

@customElement('affine-database-date-cell')
export class DateCell extends BaseCellRenderer<number> {
  static override styles = css`
    affine-database-date-cell {
      width: 100%;
    }

    .affine-database-date {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0;
      border: none;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      color: var(--affine-text-primary-color);
      font-weight: 400;
      background-color: transparent;
      font-size: var(--data-view-cell-text-size);
      line-height: var(--data-view-cell-text-line-height);
      height: var(--data-view-cell-text-line-height);
    }
  `;

  override render() {
    const value = this.value ? format(new Date(this.value), 'yyyy/MM/dd') : '';
    return html` <div class="affine-database-date date">${value}</div>`;
  }
}

@customElement('affine-database-date-cell-editing')
export class DateCellEditing extends BaseCellRenderer<number> {
  static override styles = css`
    affine-database-date-cell-editing {
      width: 100%;
      cursor: text;
    }

    .affine-database-date:focus {
      outline: none;
    }
  `;

  @query('input')
  private _inputEle!: HTMLInputElement;

  private _prevPortalAbortController: AbortController | null = null;

  override onExitEditMode() {
    this._setValue();
  }

  private _setValue = (str: string = this._inputEle.value) => {
    if (str === '') {
      this.onChange(undefined);
      this._inputEle.value = '';
      return;
    }

    const date = new Date(str);
    const value = format(date, 'yyyy-MM-dd');
    this.onChange(date.getTime());
    this._inputEle.value = `${value ?? ''}`;
  };

  override firstUpdated() {
    this._inputEle.focus();
  }

  private _onFocus = () => {
    // this._inputEle.showPicker();
    this._prevPortalAbortController?.abort();
    const abortController = new AbortController();
    this._prevPortalAbortController = abortController;

    createLitPortal({
      abortController,
      closeOnClickAway: true,
      computePosition: {
        referenceElement: this._inputEle,
        placement: 'bottom',
        middleware: [offset(10), flip()],
      },
      template: () => {
        const datePicker = new DatePicker();
        datePicker.value = this.value ?? Date.now();
        datePicker.onChange = (date: Date) => {
          this._setValue(date.toISOString());
        };
        return datePicker;
      },
    });
  };

  override render() {
    const value = this.value ? format(this.value, 'yyyy-MM-dd') : '';
    return html`<input
      type="date"
      class="affine-database-date date"
      .value="${value}"
      @focus=${this._onFocus}
    />`;
  }
}

columnRenderer.register({
  type: datePureColumnConfig.type,
  icon: createIcon('DateTime'),
  cellRenderer: {
    view: createFromBaseCellRenderer(DateCell),
    edit: createFromBaseCellRenderer(DateCellEditing),
  },
});

export const dateColumnConfig = datePureColumnConfig;
