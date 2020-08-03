import React, { Component, Children } from "react";
//import SortableTree, { addNodeUnderParent, removeNodeAtPath } from '../src';
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
  toggleExpandedForAll,
  changeNodeAtPath,
  getFlatDataFromTree,
  getTreeFromFlatData,
  SortableTreeWithoutDndContext,
} from "react-sortable-tree";
import CustomTheme from "../index";
import "./app.css";
import ReactDOM from "react-dom";
import TextareaAutosize from "react-autosize-textarea";
import { node } from "prop-types";
import PropTypes from "prop-types";
import { DndProvider, DragSource } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Controller from "./controller/Controller";
// -------------------------
// Create an drag source component that can be dragged into the tree
// https://react-dnd.github.io/react-dnd/docs-drag-source.html
// -------------------------
// This type must be assigned to the tree via the `dndType` prop as well
const externalNodeType = "yourNodeType";
const externalNodeSpec = {
  // This needs to return an object with a property `node` in it.
  // Object rest spread is recommended to avoid side effects of
  // referencing the same object in different trees.
  beginDrag: (componentProps) => ({ node: { ...componentProps.node } }),
};
const externalNodeCollect = (connect /* , monitor */) => ({
  connectDragSource: connect.dragSource(),
  // Add props via react-dnd APIs to enable more visual
  // customization of your component
  // isDragging: monitor.isDragging(),
  // didDrop: monitor.didDrop(),
});
class externalNodeBaseComponent extends Component {
  render() {
    const { connectDragSource, node } = this.props;

    return connectDragSource(
      <div
        style={{
          display: "inline-block",
          padding: "3px 5px",
          background: "blue",
          color: "white",
        }}
      >
        {node.title}
      </div>,
      { dropEffect: "copy" }
    );
  }
}
externalNodeBaseComponent.propTypes = {
  node: PropTypes.shape({ title: PropTypes.string }).isRequired,
  connectDragSource: PropTypes.func.isRequired,
};
const YourExternalNodeComponent = DragSource(
  externalNodeType,
  externalNodeSpec,
  externalNodeCollect
)(externalNodeBaseComponent);
const initialData = [
  { id: "0", name: "", parent: null, isMain: true },
  { id: "1", name: "", parent: null, isMain: true },
  { id: "2", name: "", parent: null, isMain: true },
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainsearchString: "",
      searchString: "",
      searchFocusIndex: 0,
      next: 0,
      searchFoundCount: null,
      mainStepsearchFoundCount: null,
      lastMovePrevPath: null,
      lastMoveNextPath: null,
      lastMoveNode: null,
      parentNode: null,

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
    this.nextStep = this.nextStep.bind(this);
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
  nextStep() {
    this.setState({ next: this.state.next + 1 });
  }
  render() {
    const {
      searchString,
      searchFocusIndex,
      searchFoundCount,
      next,
      mainStepFocusIndex,
      mainStepsearchFoundCount,
      lastMovePrevPath,
      lastMoveNextPath,
      lastMoveNode,
      parentNode,
      mainsearchString,
    } = this.state;

    const recordCall = (name, args) => {
      // eslint-disable-next-line no-console
      console.log(`${name} called with arguments:`, args);
    };

    const getNodeKey = ({ treeIndex }) => treeIndex;
    const COLORS = ["Yellow", "Red", "Black", "Green", "Blue"];
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

    // Case insensitive search of `node.name`
    const customSearchMethod = ({ node, searchQuery }) =>
      searchQuery &&
      node.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;

    const findMain = () => {
      var temp2 = 0;
      for (var i = 0; i < flatData.length; i++) {
        if (flatData[i].isMain) temp2++;
      }
      this.setState({
        mainStepsearchFoundCount: temp2,
      });
    };

    const countMainMethod = ({ node, searchQuery }) => node.isMain == true;

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
          <button onClick={this.nextStep}>Next Step</button>
          <Controller />
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
            dndType={externalNodeType}
            onMoveNode={(args) => {
              recordCall("onMoveNode", args);
              const { prevPath, nextPath, node, nextParentNode } = args;
              this.setState({
                lastMovePrevPath: prevPath,
                lastMoveNextPath: nextPath,
                lastMoveNode: node,
                parentNode: nextParentNode,
                mainsearchString: "",
              });

              var temp2 = 0;
              for (var i = 0; i < flatData.length; i++) {
                if (flatData[i].isMain) temp2++;
              }
              this.setState({
                mainStepsearchFoundCount: temp2,
              });

              node.id = nextPath.join(".");
              node.parent = nextParentNode;
              //treeData;
              if (nextParentNode == null) {
                node.isMain = true;
              } else {
                node.isMain = false;
              }

              if (
                nextParentNode != null &&
                nextParentNode.children != null &&
                nextParentNode.children.length > 1 &&
                nextParentNode.children != undefined
              ) {
                var temp = parseInt(node.id.slice(-1));
                for (var i = temp; i < nextParentNode.children.length; i++) {
                  var temp2 =
                    parseInt(nextParentNode.children[i].id.slice(-1)) + 1;
                  nextParentNode.children[i].id =
                    nextParentNode.children[i].id.substring(
                      0,
                      nextParentNode.children[i].id.length - 1
                    ) + temp2;
                }
              } else if (
                nextParentNode != null &&
                nextParentNode.children.length <= 1 &&
                nextParentNode.children != undefined
              ) {
                node.id = node.id.substring(0, node.id.length - 1) + 1;
              }
            }}
            onDragStateChanged={(args) =>
              recordCall("onDragStateChanged", args)
            }
            searchFinishCallback={(matches) =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex:
                  matches.length > 0 ? searchFocusIndex % matches.length : 0,
              })
            }
            generateNodeProps={({ node, path }) => ({
              style: {
                boxShadow:
                  next === 0
                    ? `0 0 0 10px ${COLORS[next + 1]}`
                    : `0 0 0 10px ${COLORS[next + 3]}`,
              },
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
                  onClick={findMain}
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
                                  mainsearchString: event.target.value,
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
                            //"\n.\n" +
                            node.id +
                            "." +
                            (node.children == undefined
                              ? 1
                              : node.children.length + 1),
                          parent: node,
                        },
                        addAsFirstChild: state.addAsFirstChild,
                      }).treeData,
                    }))
                  }
                >
                  Add Sup Step
                </button>,
                <button
                  onClick={findMain}
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
        {lastMoveNode && (
          <div>
            Node &quot;{lastMoveNode.title}&quot; moved from path [
            {lastMovePrevPath.join(",")}] to path [{lastMoveNextPath.join(",")}
            ].
          </div>
        )}
        <div style={{ flex: "0 0 0%", padding: "0 0 0 0px" }}>
          <SortableTree
            // count main steps
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            searchMethod={countMainMethod}
            searchQuery={mainsearchString}
            searchFinishCallback={(matches) =>
              this.setState({
                mainStepsearchFoundCount: matches.length,
              })
            }
          />
        </div>
        <button
          onClick={findMain}
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
                id: mainStepsearchFoundCount,
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
