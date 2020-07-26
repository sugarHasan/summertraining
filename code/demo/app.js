import React, { Component, Children } from "react";
//import SortableTree, { addNodeUnderParent, removeNodeAtPath } from '../src';
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
  toggleExpandedForAll,
  changeNodeAtPath,
  getFlatDataFromTree,
  getTreeFromFlatData,
} from "react-sortable-tree";
import CustomTheme from "../index";
import "./app.css";
import ReactDOM from "react-dom";
import TextareaAutosize from "react-autosize-textarea";
import { node } from "prop-types";

const initialData = [
  { id: "1", name: "", parent: null, isMain: true },
  { id: "2", name: "", parent: null, isMain: true },
  { id: "3", name: "", parent: null, isMain: true },
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchString: "",
      searchFocusIndex: 0,
      searchFoundCount: null,
      mainStepsearchFoundCount: null,
      treeData: getTreeFromFlatData({
        flatData: initialData.map((node) => ({
          ...node,
          title: node.name,
          isMain: node.isMain,
        })),
        getKey: (node) => node.id, // resolve a node's key
        getParentKey: (node) => node.parent, // resolve a node's parent's key
        rootKey: null, // The value of the parent key when there is no parent (i.e., at root level)
      }),
      addAsFirstChild: false,
    };
    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
  }

  updateTreeData(treeData) {
    this.setState({ treeData });
  }

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }

  render() {
    const {
      searchString,
      searchFocusIndex,
      searchFoundCount,
      mainStepFocusIndex,
      mainStepsearchFoundCount,
    } = this.state;

    const getNodeKey = ({ treeIndex }) => treeIndex;

    const flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.name,
      isMain: node.isMain,
      // The last entry in the path is this node's key
      // The second to last entry (accessed here) is the parent node's key
      parent: path.length > 1 ? path[path.length - 2] : null,
    }));
    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map((k) =>
          k === "children" ? "children: Array" : `${k}: '${node[k]}'`
        )
        .join(",\n   ");

      global.alert(
        "Info passed to the icon and button generators:\n\n" +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(", ")}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    // Case insensitive search of `node.name`
    const customSearchMethod = ({ node, searchQuery }) =>
      searchQuery &&
      node.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;

    const countMainMethod = ({ node }) => node.isMain == true;

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });

    return (
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <div style={{ flex: "0 0 auto", padding: "0 15px" }}>
          <h3>Pseudocode Designer</h3>
          <button onClick={this.expandAll}>Expand All</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <form
            style={{ display: "inline-block" }}
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <label htmlFor="find-box">
              <TextareaAutosize
                id="find-box"
                type="text"
                placeholder="Search..."
                value={searchString}
                onChange={(event) =>
                  this.setState({ searchString: event.target.value })
                }
              />
            </label>

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;Index:&nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;Total Found:&nbsp;
              {searchFoundCount || 0}
              &nbsp;/ Main Step Number: &nbsp;
              {mainStepsearchFoundCount || 0}
            </span>
          </form>
        </div>

        <div style={{ flex: "1 0 50%", padding: "0 0 0 15px" }}>
          <SortableTree
            theme={CustomTheme}
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            searchMethod={customSearchMethod}
            searchQuery={searchString}
            searchFocusOffset={searchFocusIndex}
            style={{ width: "600px" }}
            rowHeight={45}
            searchFinishCallback={(matches) =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex:
                  matches.length > 0 ? searchFocusIndex % matches.length : 0,
              })
            }
            generateNodeProps={({ node, path }) => ({
              title: (
                <TextareaAutosize
                  style={{ fontSize: "1.1rem" }}
                  value={node.name}
                  placeholder="Enter Code Here..."
                  /*
                  onResize={(event) => {
                    console.log(event.type);
                  }}
                  */
                  onChange={(event) => {
                    const name = event.target.value;

                    this.setState((state) => ({
                      treeData: changeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                        newNode: { ...node, name },
                      }),
                    }));
                  }}
                />
              ),
              buttons: [
                <button
                  onClick={() =>
                    this.setState((state) => ({
                      treeData: addNodeUnderParent({
                        treeData: state.treeData,
                        parentKey: path[path.length - 1],
                        expandParent: true,
                        getNodeKey,
                        newNode: {
                          title: (
                            <TextareaAutosize
                              style={{ fontSize: "1.1rem" }}
                              value={""}
                              placeholder="Enter Code Here..."
                              onChange={(event) => {
                                const name = event.target.value;

                                this.setState((state) => ({
                                  treeData: changeNodeAtPath({
                                    treeData: state.treeData,
                                    path,
                                    getNodeKey,
                                    newNode: { ...node, name },
                                  }),
                                }));
                              }}
                            />
                          ),
                          id:
                            //(node.children == undefined ? "     " : "") +
                            "\n.\n" +
                            (node.id +
                              "." +
                              (node.children == undefined
                                ? 1
                                : node.children.length + 1)),
                        },
                        addAsFirstChild: state.addAsFirstChild,
                      }).treeData,
                    }))
                  }
                >
                  Add Sup Step
                </button>,
                <button
                  //onClick={countMainMethod}
                  onClick={() =>
                    this.setState((state) => ({
                      treeData: removeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                      }),
                    }))
                  }
                >
                  Remove
                </button>,
              ],
            })}
          />
        </div>
        <div style={{ flex: "0 0 0%", padding: "0 0 0 0px" }}>
          <SortableTree
            // count main steps
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            searchMethod={countMainMethod}
            searchFinishCallback={(matches) =>
              this.setState({
                mainStepsearchFoundCount: matches.length,
              })
            }
          />
        </div>
        <button
          onClick={() =>
            this.setState((state) => ({
              treeData: state.treeData.concat({
                title: (
                  <TextareaAutosize
                    style={{ fontSize: "1.1rem" }}
                    placeholder="Enter Code Here..."
                    value={""}
                    onChange={(event) => {
                      const name = event.target.value;

                      this.setState((state) => ({
                        treeData: changeNodeAtPath({
                          treeData: state.treeData,
                          path,
                          getNodeKey,
                          newNode: { ...node, name },
                        }),
                      }));
                    }}
                  />
                ),
                id: mainStepsearchFoundCount + 1,
                // calismiyor parent ve isMain
                parent: null,
                isMain: true,
              }),
            }))
          }
        >
          Add Main Step
        </button>
        <br />
        <label htmlFor="addAsFirstChild">
          Add new nodes at start
          <input
            name="addAsFirstChild"
            type="checkbox"
            checked={this.state.addAsFirstChild}
            onChange={() =>
              this.setState((state) => ({
                addAsFirstChild: !state.addAsFirstChild,
              }))
            }
          />
        </label>

        <div>
          ↓PseudoCode↓
          <ul>
            {flatData.map(({ id, name, parent }) => (
              <li key={id}>
                //{id}, code: {name}, parent: {parent || "null"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
