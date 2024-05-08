import React, { PureComponent } from 'react'
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import Handsontable from "handsontable";
import { registerLanguageDictionary, zhCN } from "handsontable/i18n";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { data, cell, merge, captain, camelCase, ws, parseTheme, columns, colorToHex } from './fileView'
import FileViewer from 'react-file-viewer';
import PDF from './PDF';

import { Card, Divider, notification } from 'antd';
import './MyCard.css'
// Chinese Register
registerLanguageDictionary(zhCN);

export default class Mycard extends PureComponent {
  state = {
    cols: '',
    rows: '',
    numPages: 1,
    pageNumber: 1
  }
  //Cutomize render
  init(workbook, sheetIndex) {
    const borders = ["left", "right", "top", "bottom"];
    Handsontable.renderers.registerRenderer(
      "styleRender",
      (hotInstance, TD, row, col, prop, value, cell) => {
        Handsontable.renderers.getRenderer("text")(
          hotInstance,
          TD,
          row,
          col,
          prop,
          value,
          cell
        );
        if (ws(workbook, sheetIndex) && cell.style) {
          const {
            style: { alignment: { wrapText } = {}, border, fill, font },
          } = cell;
          const style = TD.style;
          if (font) {
            if (font.bold) style.fontWeight = "bold";
            if (font.size) style.fontSize = `${font.size}px`;
            if (font.color) {
              const { theme, argb, tint } = font.color
              if (theme) {
                if (tint) {
                  style.color = colorToHex(theme, tint)
                } else {
                  style.color = colorToHex(theme, 0)
                }
              }
              if (argb) {
                style.color = '#' + argb.substring(2);
              }
            }
          }
          if (fill) {
            // if (fill.bgColor) {
            //   const { argb, indexed } = fill.bgColor;
            //   style.backgroundColor = `#${argb || indexedColors[indexed]}`;
            // }
            if (fill.fgColor) {
              const { theme, argb, tint } = fill.fgColor
              if (theme) {
                if (tint) {
                  style.backgroundColor = colorToHex(theme, tint)
                } else {
                  style.backgroundColor = colorToHex(theme, 0)
                }
              }
              if (argb) {
                style.backgroundColor = '#' + argb.substring(2);
              }
            }
          }
          if (border) {
            borders
              .map((key) => ({ key, value: border[key] }))
              .filter((v) => v.value)
              .forEach((v) => {
                const {
                  key,
                  value: { style: borderStyle },
                } = v;
                const prefix = `border${captain(key)}`;
                if (borderStyle === "thin") {
                  style[`${prefix}Width`] = "1px";
                } else {
                  style[`${prefix}Width`] = "2px";
                }
                style[`${prefix}Style`] = "solid";
                style[`${prefix}Color`] = "#000";
              });
          }
        }
        // Applied Inner CSS
        if (cell.css) {
          const style = TD.style;
          const { css } = cell;
          Object.keys(css).forEach((key) => {
            const k = camelCase(key);
            style[k] = css[key];
          });
        }
      }
    );
  }
  openNotification = (type, src, name) => {
    if (type === 'doc' || type === 'docx') {
      notification.info({
        message: `${name} File View`,
        description:
          <FileViewer
            fileType='docx'//file type
            //filePath={require('..')} //file address
          />,
        placement: 'top',
        duration: null,
        maxCount: 1,
        className: 'notify'
      });
    } else if (type === 'xsl' || type === 'xslx') {
      //convert to blob
      const ExcelJS = require('exceljs');
      var url = "xianxue";
      var req = new XMLHttpRequest();
      const _this = this
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
      req.onload = function (e) {
        (new ExcelJS.Workbook().xlsx.load(this.response)).then(workbook => {
          _this.init(workbook, 1)
          notification.info({
            message: `${name} File View`,
            description:
              <HotTable
                language="zh-CN"
                readOnly={true}
                copyPaste={true}
                data={data(workbook, 1)}
                cell={cell(workbook, 1)}
                mergeCells={merge(workbook, 1)}
                rowHeaders={true}
                width={'auto'}
                height={'auto'}
                licenseKey="non-commercial-and-evaluation"
                columns={columns(workbook, 1)}
                manualColumnResize={true}
                manualRowResize={true}
                colHeaders={true}
              />
            ,
            placement: 'top',
            duration: null,
            maxCount: 1,
            className: 'notify'
          });
        })
      }
      req.send();

    } else if (type === 'pdf') {
      notification.info({
        message: `${name} file view`,
        description:
          <PDF />
        ,
        placement: 'top',
        duration: null,
        maxCount: 1,
        className: 'notify'
      });
    }

  };
  render() {
    const { name, size, type, position, src } = this.props

    let imgsrc =
      type === 'doc' || type === 'docx' ? 'docx' :
        type === 'xsl' || type === 'xslx' ? 'excel' :
          type === 'pdf' ? 'PDF1' :
            type === 'csv' ? 'csv' : 'file'
    return (
      <div style={{ width: '300px' }}>
        <Card title={
          <div style={{ width: '100%' }}>
            <div style={{ float: 'left', position: 'relative', top: '0.1rem' }}>
              <img src={imgsrc} alt="failed to load img" width='35px' height='40px' />
            </div>
            <div style={{ float: 'left', marginLeft: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{name}</div>
              <div style={{ fontSize: '13px', color: '#A7A8A8', fontWeight: '400' }}>{size}</div>
            </div>
          </div>
        } bordered={false} style={{ width: '100%', }}>
          {
            imgsrc === 'file' ?
              position === 'right' ?
                <div style={{ color: '#007FE1', width: '100%' }}>
                  <span className='poin'>Open folder</span>
                  <span className='poin'><Divider type="vertical" /></span>
                  <span className='poin'>save as</span>
                </div>
                :
                <div style={{ color: '#007FE1', width: '100%' }}>
                  <span className='poin'>Download</span>
                  <span className='poin'><Divider type="vertical" /></span>
                  <span className='poin'>Save as</span>
                </div>
              :
              <div style={{ color: '#007FE1', width: '100%' }}>
                <span className='poi' onClick={() => this.openNotification(type, src, name)}>Online View</span>
                <span className='poid'><Divider type="vertical" /></span>
                <span className='poi'>Online Edit</span>
                <span className='poid'><Divider type="vertical" /></span>
                <span className='poi'>Download</span>
                <span className='poid'><Divider type="vertical" /></span>
                <span className='poi'>Save as</span>
              </div>
          }

        </Card>
      </div>
    )
  }
}
