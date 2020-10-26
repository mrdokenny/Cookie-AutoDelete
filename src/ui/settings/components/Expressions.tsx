/**
 * Copyright (c) 2017-2020 Kenny Do and CAD Team (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/graphs/contributors)
 * Licensed under MIT (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/blob/3.X.X-Branch/LICENSE)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  addExpressionUI,
  clearExpressionsUI,
  removeListUI,
} from '../../../redux/Actions';
import {
  cadLog,
  getMatchedExpressions,
  getSetting,
  validateExpressionDomain
} from '../../../services/Libs';
import { ReduxAction } from '../../../typings/ReduxConstants';
import ExpressionTable from '../../common_components/ExpressionTable';
import IconButton from '../../common_components/IconButton';
import { downloadObjectAsJSON } from '../../UILibs';
import SettingsTooltip from './SettingsTooltip';
const styles = {
  buttonStyle: {
    height: 'max-content',
    padding: '0.75em',
    width: 'max-content',
  },
  tableContainer: {
    height: `${window.innerHeight - 210}px`,
    overflow: 'auto',
  },
};

interface OwnProps {
  style?: React.CSSProperties;
}

interface StateProps {
  bName: browserName;
  contextualIdentities: boolean;
  debug: boolean;
  lists: StoreIdToExpressionList;
}

interface DispatchProps {
  onClearExpressions: (lists: StoreIdToExpressionList) => void;
  onNewExpression: (expression: Expression) => void;
  onRemoveList: (list: keyof StoreIdToExpressionList) => void;
}

type ExpressionProps = OwnProps & StateProps & DispatchProps;

class InitialState {
  public contextualIdentitiesObjects: browser.contextualIdentities.ContextualIdentity[] = [];
  public error = '';
  public expressionInput = '';
  public storeId = 'default';
  public success = '';
}

class Expressions extends React.Component<ExpressionProps> {
  public state = new InitialState();

  // Import the expressions into the list
  public importExpressions(files: Blob[]) {
    const { onNewExpression } = this.props;
    const reader = new FileReader();
    reader.onload = (file) => {
      try {
        if (!file.target) {
          this.setState({
            error: `${(files[0] as File).name} - File Not Found.`,
          });
          return;
        }
        // https://stackoverflow.com/questions/35789498/new-typescript-1-8-4-build-error-build-property-result-does-not-exist-on-t
        const target: any = file.target;
        const result: string = target.result;
        const newExpressions: StoreIdToExpressionList = JSON.parse(result);
        const storeIds = Object.keys(newExpressions);
        const errExps: string[] = [];
        storeIds.forEach((storeId) =>
          newExpressions[storeId].forEach((expression) => {
            const exps = this.parseRawExpression(expression);
            exps.forEach((exp) => {
              const e = exp.trim();
              if (e.startsWith('/') && !e.endsWith('/')) {
                errExps.push(`${e} (${storeId})`);
              }
              onNewExpression({
                ...expression,
                expression: e,
              });
            });
          }),
        );
        this.setState({
          error: '',
          success:
            errExps.length > 0
              ? browser.i18n.getMessage(
                  'regexMissingEndSlash',
                  errExps.join(' '),
                )
              : '',
        });
      } catch (error) {
        this.setState({
          error: `${(files[0] as File).name} - ${error.toString()}.`,
        });
      }
    };

    reader.readAsText(files[0]);
  }

  // Add the expression using the + button or the Enter key
  public addExpressionByInput(payload: Expression) {
    const { onNewExpression } = this.props;
    const exps = this.parseRawExpression(payload);
    const invalidInputs: string[] = [];
    const inputReasons: string[] = [];
    exps.forEach((exp) => {
      const expTrim = exp.trim();
      if (!expTrim) return;
      const result = validateExpressionDomain(expTrim).trim();
      if (result) {
        // invalid
        invalidInputs.push(expTrim);
        inputReasons.push(`${expTrim} -> ${result}`);
      } else {
        // valid
        onNewExpression({
          ...payload,
          expression: expTrim,
        });
      }
    });
    this.setState({
      expressionInput: invalidInputs.join(', '),
    });
    if (inputReasons.length > 0) {
      this.setState({
        error: `${browser.i18n.getMessage(
          'invalidNewExpressions',
        )}\n${inputReasons.join('\n')}`,
      });
    }
  }

  private parseRawExpression(exp: Expression): string[] {
    const exps = exp.expression.split(',');
    const expressions: string[] = [];
    let skipTimes = 0;
    exps.forEach((e, i, a) => {
      // Ignore if expression was a continuation of regex but had a comma
      if (skipTimes > 0) {
        skipTimes--;
        return;
      }
      // skipTimes should be 0 at this point
      let ee = e.trim();
      // Check for regex slash start
      if (ee.startsWith('/')) {
        // Continue to parse next set of comma-separated values until the next end slash
        while (!ee.endsWith('/')) {
          skipTimes++;
          if (i + skipTimes >= a.length) {
            // We have reached the end of the array and did not find an end slash.
            // We will import as combined.
            break;
          }
          ee += `,${a[i + skipTimes].trim()}`;
        }
      }
      // At this point it should be either a complete regex with start and end
      // slash, or a domain.
      expressions.push(ee);
    });
    return expressions;
  }

  public clearListsConfirmation(lists: StoreIdToExpressionList) {
    const { debug, onClearExpressions } = this.props;
    const listKeys = Object.keys(lists);
    let expCount = 0;
    listKeys.forEach((k) => {
      expCount += lists[k].length;
    });
    if (listKeys.length === 0 && expCount === 0) {
      this.setState({
        error: browser.i18n.getMessage('removeAllExpressionsNoneFound'),
      });
    } else {
      const r = window.prompt(
        browser.i18n.getMessage('removeAllExpressionsConfirm', [
          expCount.toString(),
          listKeys.length.toString(),
        ]),
      );
      cadLog(
        {
          msg: `Clear Expressions Prompt returned [ ${r} ]`,
          type: 'info',
        },
        debug,
      );
      if (r !== null && r === expCount.toString()) {
        onClearExpressions(this.props.lists);
        this.setState({
          success: browser.i18n.getMessage('removeAllExpressions'),
        });
      }
    }
  }

  public removeListConfirmation(
    list: keyof StoreIdToExpressionList,
    expressions: ReadonlyArray<Expression>,
  ) {
    const { debug, onRemoveList } = this.props;
    const expCount = (expressions || []).length;
    if (expCount === 0) {
      this.setState({
        error: browser.i18n.getMessage('removeAllExpressionsNoneFound'),
      });
    } else {
      const r = window.prompt(
        browser.i18n.getMessage('removeAllExpressionsConfirm', [
          expCount.toString(),
          list.toString(),
        ]),
      );
      cadLog(
        {
          msg: `Remove Expressions Prompt for ${list} returned [ ${r} ]`,
          type: 'info',
        },
        debug,
      );
      if (r !== null && r === expCount.toString()) {
        onRemoveList(list);
        this.setState({
          success: `${browser.i18n.getMessage('removeListText')}: ${list}`,
        });
      }
    }
  }

  public createDefaultOptions() {
    const { bName, contextualIdentities, lists, onNewExpression } = this.props;
    const { contextualIdentitiesObjects } = this.state;
    const containers = new Set<string>(Object.keys(lists));
    if (contextualIdentities) {
      contextualIdentitiesObjects.forEach((c) =>
        containers.add(c.cookieStoreId),
      );
    }
    containers.add(
      ((browser) => {
        switch (browser) {
          case browserName.Chrome:
          case browserName.Opera:
            return '0';
          case browserName.Firefox:
          default:
            return 'firefox-default';
        }
      })(bName),
    );
    containers.forEach((id) => {
      [ListType.GREY, ListType.WHITE].forEach((lt) => {
        onNewExpression({
          expression: `_Default:${lt}`,
          listType: lt,
          storeId: id,
        });
      });
    });
  }

  public getDerivedStateFromProps(nextProps: ExpressionProps) {
    if (!nextProps.contextualIdentities) {
      this.changeStoreIdTab('default');
    }
  }

  // Change the id of the storeId for the container tabs
  public changeStoreIdTab(storeId: string) {
    this.setState({
      storeId,
    });
  }

  public async componentDidMount() {
    if (this.props.contextualIdentities) {
      const contextualIdentitiesObjects = await browser.contextualIdentities.query(
        {},
      );
      this.setState({
        contextualIdentitiesObjects,
      });
    }
  }

  public render() {
    const { style, lists, contextualIdentities } = this.props;
    const { error, contextualIdentitiesObjects, storeId, success } = this.state;
    const mapIDtoName: { [k: string]: string | undefined } = {};
    if (contextualIdentities) {
      contextualIdentitiesObjects.forEach((c) => {
        mapIDtoName[c.cookieStoreId] = c.name;
      });
      Object.keys(lists).forEach((list) => {
        if (list === 'default') return;
        const container = contextualIdentitiesObjects.find((c) => {
          return c.cookieStoreId === list;
        });
        if (!container) {
          mapIDtoName[list] = undefined;
        }
      });
    }

    return (
      <div className="col" style={style}>
        <h1>{browser.i18n.getMessage('expressionListText')}</h1>

        <div className="row">
          <input
            style={{
              display: 'inline',
              width: '100%',
            }}
            value={this.state.expressionInput}
            onChange={(e) =>
              this.setState({
                expressionInput: e.target.value,
              })
            }
            placeholder={browser.i18n.getMessage('domainPlaceholderText')}
            onKeyUp={(e) => {
              if (e.key.toLowerCase() === 'enter') {
                this.addExpressionByInput({
                  expression: this.state.expressionInput,
                  listType: e.shiftKey ? ListType.GREY : ListType.WHITE,
                  storeId,
                });
              }
            }}
            type="url"
            id="formText"
            autoFocus={true}
            className="form-control"
            formNoValidate={true}
          />
        </div>
        <div className="row">
          <a
            target="_blank"
            rel="help noreferrer noopener"
            href="https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enter-expression"
          >
            {browser.i18n.getMessage('questionExpression')}
            <SettingsTooltip hrefURL="#enter-expression" />
          </a>
        </div>
        <div
          className="row"
          style={{
            columnGap: '0.5em',
            justifyContent: 'space-between',
            paddingBottom: '8px',
            paddingTop: '8px',
          }}
        >
          <div className="col-sm col-md-auto">
            <div
              className="row justify-content-sm-center justify-content-md-start"
              style={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <IconButton
                className="btn-primary"
                iconName="download"
                role="button"
                onClick={() =>
                  downloadObjectAsJSON(this.props.lists, 'Expressions')
                }
                title={browser.i18n.getMessage('exportTitleTimestamp')}
                text={browser.i18n.getMessage('exportURLSText')}
                styleReact={styles.buttonStyle}
              />
              <IconButton
                tag="input"
                className="btn-info"
                iconName="upload"
                type="file"
                accept="application/json"
                onChange={(e) => this.importExpressions(e.target.files)}
                text={browser.i18n.getMessage('importURLSText')}
                title={browser.i18n.getMessage('importURLSText')}
                styleReact={styles.buttonStyle}
              />
            </div>
            <div className="w-100" />
            <div
              className="row justify-content-sm-center justify-content-md-start"
              style={{
                marginTop: '5px',
                marginBottom: '5px',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <IconButton
                tag="button"
                className="btn-danger"
                iconName="trash"
                role="button"
                onClick={() => this.clearListsConfirmation(this.props.lists)}
                text={browser.i18n.getMessage('removeAllExpressions')}
                title={browser.i18n.getMessage('removeAllExpressions')}
                styleReact={styles.buttonStyle}
              />
              <IconButton
                tag="button"
                className="btn-dark"
                iconName="list-alt"
                role="button"
                onClick={() => this.createDefaultOptions()}
                text={browser.i18n.getMessage(
                  'createDefaultExpressionOptionsText',
                )}
                title={browser.i18n.getMessage(
                  'createDefaultExpressionOptionsText',
                )}
                styleReact={styles.buttonStyle}
              />
              {contextualIdentities && (
                <IconButton
                  tag="button"
                  className="btn-danger"
                  iconName="trash"
                  role="button"
                  onClick={() => {
                    this.removeListConfirmation(
                      storeId,
                      this.props.lists[storeId],
                    );
                  }}
                  text={browser.i18n.getMessage('removeListText')}
                  title={browser.i18n.getMessage('removeListText')}
                  styleReact={styles.buttonStyle}
                />
              )}
            </div>
          </div>
          <div
            className="col-sm col-md-auto"
            style={{
              justifyContent: 'flex-end',
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <IconButton
              className="btn-secondary"
              onClick={() => {
                this.addExpressionByInput({
                  expression: this.state.expressionInput,
                  listType: ListType.GREY,
                  storeId,
                });
              }}
              styleReact={styles.buttonStyle}
              iconName="plus"
              title={browser.i18n.getMessage('toGreyListText')}
              text={browser.i18n.getMessage('greyListWordText')}
            />

            <IconButton
              className="btn-primary"
              onClick={() => {
                this.addExpressionByInput({
                  expression: this.state.expressionInput,
                  listType: ListType.WHITE,
                  storeId,
                });
              }}
              styleReact={styles.buttonStyle}
              iconName="plus"
              title={browser.i18n.getMessage('toWhiteListText')}
              text={browser.i18n.getMessage('whiteListWordText')}
            />
          </div>
        </div>

        {error !== '' ? (
          <div
            onClick={() => this.setState({ error: '' })}
            className="row alert alert-danger alertPreWrap"
          >
            {error}
          </div>
        ) : (
          ''
        )}
        {success !== '' ? (
          <div
            onClick={() => this.setState({ success: '' })}
            className="row alert alert-success alertPreWrap"
          >
            {browser.i18n.getMessage('successText')} {success}
          </div>
        ) : (
          ''
        )}
        {contextualIdentities && (
          <h5>
            {browser.i18n.getMessage('currentContainerInfo', [
              storeId === 'default'
                ? browser.i18n.getMessage('defaultText')
                : storeId,
              mapIDtoName[storeId] ||
                browser.i18n.getMessage(
                  storeId === 'default'
                    ? 'defaultContainerText'
                    : 'missingContainerText',
                ),
            ])}
          </h5>
        )}
        {contextualIdentities && (
          <ul className="row nav nav-tabs flex-column flex-sm-row">
            <li
              onClick={() => {
                this.changeStoreIdTab('default');
              }}
              className="nav-item"
            >
              <a
                className={`nav-link ${storeId === 'default' ? 'active' : ''}`}
                href="#tabExpressionList"
              >
                {browser.i18n.getMessage('defaultText')}
              </a>
            </li>
            {Object.entries(mapIDtoName).map(([cookieStoreId, name]) => (
              <li
                key={`navTab-${cookieStoreId}`}
                onClick={() => {
                  this.changeStoreIdTab(cookieStoreId);
                }}
                className="nav-item"
              >
                <a
                  className={`nav-link ${
                    storeId === cookieStoreId ? 'active' : ''
                  } ${name ? '' : 'text-danger'}`}
                  href="#tabExpressionList"
                >
                  {name || browser.i18n.getMessage('missingContainerText')}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="row" style={styles.tableContainer}>
          <ExpressionTable
            expressionColumnTitle={browser.i18n.getMessage(
              'domainExpressionsText',
            )}
            expressions={getMatchedExpressions(
              lists,
              storeId,
              this.state.expressionInput,
              true,
            )}
            storeId={storeId}
            emptyElement={
              <span>
                {browser.i18n.getMessage(
                  this.state.expressionInput.trim().length === 0
                    ? 'noExpressionsText'
                    : 'noSearchExpressionsFound',
                )}
              </span>
            }
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => {
  const { cache, lists } = state;
  return {
    bName: cache.browserDetect || (browserDetect() as browserName),
    contextualIdentities: getSetting(
      state,
      SettingID.CONTEXTUAL_IDENTITIES,
    ) as boolean,
    debug: getSetting(state, SettingID.DEBUG_MODE) as boolean,
    lists,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => ({
  onClearExpressions(payload: StoreIdToExpressionList) {
    dispatch(clearExpressionsUI(payload));
  },
  onNewExpression(payload: Expression) {
    dispatch(addExpressionUI(payload));
  },
  onRemoveList(payload: keyof StoreIdToExpressionList) {
    dispatch(removeListUI(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Expressions);
