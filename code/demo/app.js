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
} from "../src";

import CustomTheme from "../index";
import "react-sortable-tree/style.css";
import "./app.css";
import ReactDOM from "react-dom";
import TextareaAutosize from "react-autosize-textarea";
import { node } from "prop-types";
import PropTypes from "prop-types";
import { DndProvider, DragSource } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

//this part is for drag and drop external steps like for loop, while loop, if vs. But not working correctly

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

//initial notes that are displayed in the beginning

const initialData = [
  { id: 0, name: "", parent: null },
  { id: 1, name: "", parent: null },
  { id: 2, name: "", parent: null },
];
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainsearchString: "", //empty string for counting main steps
      searchString: "", //search word
      searchFocusIndex: 0, //search index in found results
      searchFoundCount: null, // number of found results
      mainStepsearchFoundCount: null, //number of main steps
      lastMovePrevPath: null, //those are necessary for which node is moved from where to where
      lastMoveNextPath: null,
      lastMoveNode: null,
      traceFocusIndex: 0, //step tracing
      traceFoundCount: null,

      //treedata where all nodes information are stored. It is not global data so be careful
      treeData: getTreeFromFlatData({
        flatData: initialData.map((node) => ({
          ...node,
          title: node.name,
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

  //update tree
  updateTreeData(treeData) {
    this.setState({ treeData });
  }

  //expend or collapse method
  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  //expending children of all nodes
  expandAll() {
    this.expand(true);
  }

  //collapsing children of all nodes
  collapseAll() {
    this.expand(false);
  }

  render() {
    var {
      searchString,
      searchFocusIndex,
      searchFoundCount,
      mainStepsearchFoundCount,
      lastMovePrevPath,
      lastMoveNextPath,
      lastMoveNode,
      mainsearchString,
      traceFocusIndex,
      traceFoundCount,
    } = this.state;

    //for testing in console
    const recordCall = (name, args) => {
      // eslint-disable-next-line no-console
      console.log(`${name} called with arguments:`, args);
    };

    const getNodeKey = ({ treeIndex }) => treeIndex;

    //flatdata is array version of treedata so you can access all nodes like flatdata[i]
    var flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.name,
      // The last entry in the path is this node's key
      // The second to last entry (accessed here) is the parent node's key
      parent: path.length > 1 ? path[path.length - 2] : null,
    }));

    // Case insensitive search of `node.name`
    /*
    const customSearchMethod = ({ node, searchQuery }) =>
      searchQuery &&
      node.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;
      */

    //finding how many main steps
    const findMain = (num) => {
      var temp2 = 0;
      for (var i = 0; i < flatData.length; i++) {
        if (flatData[i].parent == null) {
          temp2++;
        }
      }
      this.setState({
        mainStepsearchFoundCount:
          num == null ? temp2 : mainStepsearchFoundCount,
      });
    };

    //recussion function that do recursive thought the all nodes in flat data and fix their ids. It should work if I am correct but I couldnt test it because main and sub step ids are not refreshing on time
    const refreshIndexes = (n, parentId, depth, childNum) => {
      if (n == null || n == undefined) return;

      //console.log(childNum);
      if (n.parent != null) n.id = parentId + "." + childNum;

      if (
        n.children != null &&
        n.children.length > 0 &&
        n.children != undefined
      ) {
        for (var i = 0; i < n.children.length; i++) {
          //console.log(n.children[i]);
          refreshIndexes(n.children[i], n.id, depth + 1, i + 1);
        }
      }
    };
    //custom search method for main steps count
    const countMainMethod = ({ node, searchQuery }) => node.parent == null;

    //custom search method for tracing
    const tracing = ({ node, searchQuery }) => node != null;

    //trace prev step
    const selectPrevStep = () =>
      this.setState({
        traceFocusIndex:
          traceFocusIndex !== null
            ? (traceFoundCount + traceFocusIndex - 1) % traceFoundCount
            : traceFoundCount - 1,
      });

    //trace next step
    const selectNextStep = () =>
      this.setState({
        traceFocusIndex:
          traceFocusIndex !== null
            ? (traceFocusIndex + 1) % traceFoundCount
            : 0,
      });

    return (
      //html part. nothing is important here
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
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
              <button
                type="button"
                disabled={!traceFoundCount}
                onClick={selectPrevStep}
              >
                Prev Step
              </button>
              <button
                type="submit"
                disabled={!traceFoundCount}
                onClick={selectNextStep}
              >
                Next Step
              </button>
              <span>
                &nbsp;/ Main Step Number: &nbsp;
                {mainStepsearchFoundCount || 0}
                &nbsp;/ Tracing Index: &nbsp;
                {traceFoundCount > 0 ? traceFocusIndex + 1 : 0}
                &nbsp;/ Total Step Number:&nbsp;
                {traceFoundCount || 0}
              </span>
            </form>
          </div>

          <div style={{ flex: "1 0 50%", padding: "0 0 0 15px" }}>
            <SortableTree
              theme={CustomTheme} //theme of nodes
              treeData={this.state.treeData}
              onChange={(treeData) => this.setState({ treeData })} //update onchange
              searchMethod={tracing} //searchmethod
              searchQuery={searchString} //search string
              searchFocusOffset={traceFocusIndex} //search index
              style={{ width: "600px" }}
              rowHeight={60} // row height of nodes
              //dndType={externalNodeType} // for external node part which is not working correctly right now
              onMoveNode={(args) => {
                recordCall("onMoveNode", args); //log in console when nodes are moved one place to another
                const {
                  treeData,
                  prevPath,
                  nextPath,
                  node,
                  nextParentNode,
                } = args;
                this.setState({
                  lastMovePrevPath: prevPath,
                  lastMoveNextPath: nextPath,
                  lastMoveNode: node,
                  mainsearchString: "",
                });

                node.id = nextPath.join(".");
                node.parent = nextParentNode;

                //not necessay anymore but I spend too much time on it that I dont want to delete it.
                /*
                if (
                  nextParentNode != null &&
                  nextParentNode.children != null &&
                  nextParentNode.children.length > 1 &&
                  nextParentNode.children != undefined
                ) {
                  //var temp = parseInt(node.id.slice(-1));
                  for (var i = 0; i < nextParentNode.children.length; i++) {
                    //var temp2 = parseInt(nextParentNode.children[i].id.slice(-1));
                    nextParentNode.children[i].id =
                      nextParentNode.children[i].id.substring(
                        0,
                        nextParentNode.children[i].id.length - 1
                      ) +
                      (i + 1);
                  }
                } else if (
                  nextParentNode != null &&
                  nextParentNode.children.length <= 1
                ) {
                  node.id = node.id.substring(0, node.id.length - 1) + 1;
                } else {
                  var temp = parseInt(node.id.slice(-1));
                  var temp2 = 0;
                  for (var i = 0; i < temp; i++) {
                    if (flatData[i].parent == null) {
                      //console.log(flatData[i]);
                      temp2++;
                    }
                  }
                  node.id = temp2;
                  for (var i = temp + 1; i < treeData.length; i++) {
                    if (treeData[i].parent == null) {
                      //console.log(flatData[i]);
                      treeData[i].id = treeData[i].id + 1;
                    }
                  }
                }
                */
                for (var i = 0; i < treeData.length; i++) {
                  if (treeData[i].parent == null) {
                    treeData[i].id = i;
                    refreshIndexes(treeData[i], -1, 0, -1);
                  }
                }
                findMain();
              }}
              //console log testing when node is being hold
              onDragStateChanged={(args) =>
                recordCall("onDragStateChanged", args)
              }
              //search results
              searchFinishCallback={(matches) =>
                this.setState({
                  traceFoundCount: matches.length,
                  traceFocusIndex:
                    matches.length > 0 ? traceFocusIndex % matches.length : 0,
                })
              }
              //generated nodes at the beginning. Dont confuse with add main or add sub step button created steps. Those are in below.
              generateNodeProps={({ node, path }) => ({
                title: (
                  <TextareaAutosize
                    style={{ fontSize: "1.1rem" }}
                    value={node.name}
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
                buttons: [
                  <button
                    //add sub step button
                    onClick={() => {
                      this.setState(
                        (state) => ({
                          treeData: addNodeUnderParent({
                            treeData: state.treeData,
                            parentKey: path[path.length - 1],
                            expandParent: true,
                            getNodeKey,
                            //it creates new nodes here
                            newNode: {
                              //setting new nodes title which is empty space
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
                              //setting new nodes id
                              id:
                                node.id +
                                "." +
                                (node.children == undefined
                                  ? 1
                                  : node.children.length + 1),
                              //setting new nodes parent
                              parent: node,
                            },
                            addAsFirstChild: state.addAsFirstChild,
                          }).treeData,
                        }),
                        () => {
                          findMain();
                        }
                      );
                    }}
                  >
                    Add Sup Step
                  </button>,
                  <button
                    // remove step button
                    onClick={() => {
                      this.setState(
                        (state) => ({
                          treeData: removeNodeAtPath({
                            treeData: state.treeData,
                            path,
                            getNodeKey,
                          }),
                          mainStepsearchFoundCount:
                            node.parent == null
                              ? mainStepsearchFoundCount--
                              : mainStepsearchFoundCount,
                        }),
                        () => {
                          findMain(mainStepsearchFoundCount);
                          for (var i = 0; i < this.state.treeData.length; i++) {
                            if (this.state.treeData[i].parent == null) {
                              //console.log(flatData[i]);
                              this.state.treeData[i].id = i;
                              refreshIndexes(this.state.treeData[i], -1, 0, -1);
                            }
                          }
                        }
                      );
                    }}
                  >
                    Remove
                  </button>,
                ],
              })}
            />
          </div>
          {// to show nodes are moved where to where. IT IS VERY IMPORTANT AND HELPFULL FOR DEBUGGING AND TESTING SO PLEASE USE IT.
          lastMoveNode && (
            <div>
              Node &quot;{lastMoveNode.title}&quot; moved from path [
              {lastMovePrevPath.join(",")}] to path [
              {lastMoveNextPath.join(",")}
              ].
            </div>
          )}
          <div style={{ flex: "0 0 0%", padding: "0 0 0 0px" }}>
            <SortableTree
              // this sortable tree is exact same proporties with main sortable tree but it is only for count main steps. I create this because you cannot create two search in one sortable tree.
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
          <DndProvider backend={HTML5Backend}>
            <div>
              <YourExternalNodeComponent
                node={{ title: "If ...then, do..." }}
              />
              ← drag this
            </div>
          </DndProvider>
          <button
            //add main step button
            onClick={() => {
              this.setState(
                (state) => ({
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
                  }),
                  mainStepsearchFoundCount: mainStepsearchFoundCount++,
                }),
                () => {
                  findMain(mainStepsearchFoundCount);
                }
              );
            }}
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
      </div>
    );
  }
}

export default App;
