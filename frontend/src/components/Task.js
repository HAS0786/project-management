import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import ProjectDropdown from "./ProjectDropdown";
import AddTaskModal from "./AddTaskModal";
import BtnPrimary from "./BtnPrimary";
import DropdownMenu from "./DropdownMenu";
import TaskModal from "./TaskModal";

function Task() {
  const [columns, setColumns] = useState({});
  const [isAddTaskModalOpen, setAddTaskModal] = useState(false);
  const [isRenderChange, setRenderChange] = useState(false);
  const [isTaskOpen, setTaskOpen] = useState(true);
  const [taskId, setTaskId] = useState(0);
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:9000/tasks`)
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the tasks!", error);
      });
  }, [projectId]);

  useEffect(() => {
    if (!isAddTaskModalOpen || isRenderChange) {
      axios
        .get(`http://localhost:9000/project/${projectId}`)
        .then((res) => {
          setColumns(/* Process and set your columns state based on res.data */);
          setTitle(res.data.title);
        })
        .catch((error) => {
          console.error("Error fetching project data:", error);
          toast.error("Failed to fetch project data. Please try again later.");
        });
    }
  }, [projectId, isAddTaskModalOpen, isRenderChange]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    const updatedColumns = {
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    };

    setColumns(updatedColumns);
    updateTodo(updatedColumns);
  };

  const updateTodo = (data) => {
    axios
      .put(`http://localhost:9000/project/${projectId}/todo`, data)
      .then((res) => {
        // Optional: handle response if needed
      })
      .catch((error) => {
        toast.error("Failed to update todo data");
      });
  };

  const handleDelete = (e, taskId) => {
    e.stopPropagation();
    axios
      .delete(`http://localhost:9000/project/${projectId}/task/${taskId}`)
      .then((res) => {
        toast.success("Task deleted successfully");
        setRenderChange(true);
      })
      .catch((error) => {
        toast.error("Failed to delete task");
      });
  };

  const handleTaskDetails = (taskId) => {
    setTaskId(taskId);
    setTaskOpen(true);
  };

  return (
    <div className="px-12 py-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl text-gray-800 flex justify-start items-center space-x-2.5">
          <span>
            {title.slice(0, 25)}
            {title.length > 25 && "..."}
          </span>
          <ProjectDropdown id={projectId} navigate={navigate} />
        </h1>
        <BtnPrimary onClick={() => setAddTaskModal(true)}>Add todo</BtnPrimary>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5">
          {Object.entries(columns).map(([columnId, column]) => (
            <div className="w-3/12 h-[580px]" key={columnId}>
              <div className="pb-2.5 w-full flex justify-between">
                <div className="inline-flex items-center space-x-2">
                  <h2 className="text-[#1e293b] font-medium text-sm uppercase leading-3">
                    {column.name}
                  </h2>
                  <span
                    className={`h-5 inline-flex items-center justify-center px-2 mb-[2px] leading-none rounded-full text-xs font-semibold text-gray-500 border border-gray-300 ${
                      column.items.length < 1 && "invisible"
                    }`}
                  >
                    {column.items?.length}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  width={15}
                  className="text-[#9ba8bc]"
                  viewBox="0 0 448 512"
                >
                  <path d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z" />
                </svg>
              </div>
              <div>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[530px] pt-4 duration-75 transition-colors border-t-2 border-indigo-400 ${
                        snapshot.isDraggingOver && "border-indigo-600"
                      }`}
                    >
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item._id}
                          draggableId={item._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style }}
                              onClick={() => handleTaskDetails(item._id)}
                              className={`select-none px-3.5 pt-3.5 pb-2.5 mb-2 border border-gray-200 rounded-lg shadow-sm bg-white relative ${
                                snapshot.isDragging && "shadow-md"
                              }`}
                            >
                              <div className="pb-2">
                                <div className="flex item-center justify-between">
                                  <h3 className="text-[#1e293b] font-medium text-sm capitalize">
                                    {item.title.slice(0, 22)}
                                    {item.title.length > 22 && "..."}
                                  </h3>
                                  <DropdownMenu
                                    taskId={item._id}
                                    handleDelete={handleDelete}
                                    projectId={projectId}
                                    setRenderChange={setRenderChange}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 leading-4 -tracking-tight">
                                  {item.description.slice(0, 60)}
                                  {item.description.length > 60 && "..."}
                                </p>
                                <span className="py-1 px-2.5 bg-indigo-100 text-indigo-600 rounded-md text-xs font-medium mt-1 inline-block">
                                  Task-{item.index}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
      <AddTaskModal
        isAddTaskModalOpen={isAddTaskModalOpen}
        setAddTaskModal={setAddTaskModal}
        projectId={projectId}
      />
      <TaskModal isOpen={isTaskOpen} setIsOpen={setTaskOpen} id={taskId} />
    </div>
  );
}

export default Task;
