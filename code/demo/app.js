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
import "react-sortable-tree/style.css";
import "./app.css";
import ReactDOM from "react-dom";
import TextareaAutosize from "react-autosize-textarea";
import { node } from "prop-types";
import PropTypes from "prop-types";
import { DndProvider, DragSource } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

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
  { id: "0", name: "", parent: null, isMain: true },
  { id: "1", name: "", parent: null, isMain: true },
  { id: "2", name: "", parent: null, isMain: true },
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
    const {
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

    //colors
    const colors = ["Red", "Black", "Green", "Blue"];

    //for testing in console
    const recordCall = (name, args) => {
      // eslint-disable-next-line no-console
      console.log(`${name} called with arguments:`, args);
    };

    const getNodeKey = ({ treeIndex }) => treeIndex;

    //flatdata is array version of treedata so you can access all nodes like flatdata[i]
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

    //finding how many main steps
    const findMain = (treeDataInput) => {
      var temp2 = 0;
      for (var i = 0; i < flatData.length; i++) {
        if (flatData[i].isMain) {
          if (flatData[i].parent == null) {
            node.isMain = true;
            temp2++;
          } else {
            node.isMain = false;
          }
        }
      }
      this.setState({
        mainStepsearchFoundCount: temp2,
      });
      this.setState({ treeDataInput });
    };

    //refresh main steps ids and calls recursive function to refresh childs of those main steps and visits all nodes in flatdata
    function refreshMainSteps() {
      var temp = -1;
      for (var i = 0; i < flatData.length; i++) {
        if (flatData[i].isMain) {
          flatData[i].id = temp;
          temp--;
        }
      }

      temp = 0;

      for (var i = 0; i < flatData.length; i++) {
        if (flatData[i].isMain) {
          flatData[i].id = temp;
          temp++;
          console.log(flatData[i]);
          refreshIndexes(flatData[i], -1, 0, -1);
        }
      }
      console.log(temp);
    }
    //recussion function that do recursive thought the all nodes in flat data and fix their ids. It should work if I am correct but I couldnt test it because main and sub step ids are not refreshing on time
    function refreshIndexes(n, parentIndex, depth, childNum) {
      if (
        n != null &&
        n.children != null &&
        n.children.length > 1 &&
        n.children != undefined
      ) {
        for (var i = 0; i < n.length; i++) {
          refreshIndexes(n[i], n.id, depth + 1, i);
        }
      } else {
        if (!n.isMain) {
          n.id = n.id + "." + parentIndex + ".";
          for (var i = 0; i <= depth; i++) {
            n.id = n.id + childNum;
          }
        }
      }
    }
    //custom search method for main steps count
    const countMainMethod = ({ node, searchQuery }) => node.isMain == true;

    //custom search method for tracing
    const tracing = ({ node, searchQuery }) => node != null;

    //search found index go prev
    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    //search found index go next
    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });

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
      /*
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
             &nbsp;Index:&nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;Total Found:&nbsp;
              {searchFoundCount || 0}
      */

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

                //** */
                //updating ids when nodes are moved one place to another. It works only some cases so test it, find not working cases and fix it please guys
                //** */

                node.id = nextPath.join(".");
                node.parent = nextParentNode;

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
                findMain(treeData);
                refreshMainSteps();
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
                      this.setState((state) => ({
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
                      }));
                      //I tried to call function by 1 second delay but didnt help to solve problem
                      //setTimeout(refreshMainSteps, 1000);
                      //setTimeout(findMain, 1000)
                      refreshMainSteps();
                      findMain();
                    }}
                  >
                    Add Sup Step
                  </button>,
                  <button
                    // remove step button
                    onClick={() => {
                      this.setState((state) => ({
                        treeData: removeNodeAtPath({
                          treeData: state.treeData,
                          path,
                          getNodeKey,
                        }),
                      }));
                      refreshMainSteps();
                      findMain(this.treeData);
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

          <button
            //add main step button
            onClick={() => {
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
              }));
              refreshMainSteps();
              findMain();
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
      </div>
    );
  }
}

export default App;
