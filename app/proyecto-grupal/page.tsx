"use client";

import { useState, useEffect, memo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DndContext,
  rectIntersection,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./styles.css";

interface Task {
  id: number;
  task_name: string;
  task_status: string;
  project_id: number;
  user_id: string;
}

interface Project {
  id: number;
  project_name: string;
  project_description: string;
  user_id: string;
  type: string;
}

interface SortableTaskProps {
  task: Task;
  index: number;
  selectedTaskId: number | null;
  editingTaskName: string;
  handleTaskNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTaskNameSave: (taskId: number) => void;
  handleTaskEdit: (taskId: number, e: React.MouseEvent) => void;
  handleDeleteTask: (taskId: number) => void;
}

interface DroppableColumnProps {
  status: string;
  tasks: Task[];
  activeColumn: UniqueIdentifier | null;
  selectedTaskId: number | null;
  editingTaskName: string;
  handleTaskNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTaskNameSave: (taskId: number) => void;
  handleTaskEdit: (taskId: number, e: React.MouseEvent) => void;
  handleDeleteTask: (taskId: number) => void;
}

const DroppableColumn = ({
  status,
  tasks,
  activeColumn,
  selectedTaskId,
  editingTaskName,
  handleTaskNameChange,
  handleTaskNameSave,
  handleTaskEdit,
  handleDeleteTask,
}: DroppableColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <motion.div
      ref={setNodeRef}
      className={`p-4 rounded-lg transition-all duration-300 ${
        activeColumn === status
          ? "bg-primary/30 border-4 border-primary pulse-border"
          : "bg-[#f5f5f5]"
      }`}
      animate={{ scale: activeColumn === status ? 1.06 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <h3 className="font-bold text-primary">
        {status === "todo"
          ? "Lista de Tareas"
          : status === "inProgress"
            ? "En Progreso"
            : status === "done"
              ? "Hecho"
              : "Pausadas"}
      </h3>
      <div className="min-h-[200px]">
        <SortableContext
          id={status}
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-4">
            {tasks.map((task, index) => (
              <SortableTask
                key={task.id}
                task={task}
                index={index}
                selectedTaskId={selectedTaskId}
                editingTaskName={editingTaskName}
                handleTaskNameChange={handleTaskNameChange}
                handleTaskNameSave={handleTaskNameSave}
                handleTaskEdit={handleTaskEdit}
                handleDeleteTask={handleDeleteTask}
              />
            ))}
          </ul>
        </SortableContext>
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: activeColumn === status ? 1 : 0,
              scale: activeColumn === status ? 1.1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
            className="text-center text-primary/70 mt-4 text-lg font-semibold"
          >
            Soltar aquí
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const SortableTask = memo(
  ({
    task,
    index,
    selectedTaskId,
    editingTaskName,
    handleTaskNameChange,
    handleTaskNameSave,
    handleTaskEdit,
    handleDeleteTask,
  }: SortableTaskProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? "none" : "all 0.3s ease-out",
      zIndex: isDragging ? 50 : "auto",
    };

    return (
      <motion.li
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`p-1 mb-2 bg-white rounded-lg flex justify-between items-center ${
          isDragging
            ? "shadow-2xl border-4 border-primary pulse-border opacity-70 bg-primary/10"
            : "shadow-sm"
        }`}
        animate={
          isDragging ? { scale: 1.1, rotate: 2 } : { scale: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className="w-3/4" {...listeners}>
          {selectedTaskId === task.id ? (
            <input
              type="text"
              value={editingTaskName}
              onChange={handleTaskNameChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTaskNameSave(task.id);
              }}
              onBlur={() => handleTaskNameSave(task.id)}
              className="p-1 w-3/4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
              autoFocus
            />
          ) : (
            <span className="w-3/4">{task.task_name}</span>
          )}
        </div>
        <div className="dropdown dropdown-bottom dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn m-1"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            ...
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm"
          >
            <li>
              <button
                onClick={(e) => handleTaskEdit(task.id, e)}
                className="block text-primary mb-2"
              >
                Editar Tarea
              </button>
            </li>
            <li>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="block text-red-500"
              >
                Eliminar Tarea
              </button>
            </li>
          </ul>
        </div>
      </motion.li>
    );
  }
);

SortableTask.displayName = "SortableTask";

export default function ProyectoGrupal() {
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [task, setTask] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("todo");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>("");
  const [selectedProjectIdForEdit, setSelectedProjectIdForEdit] = useState<
    number | null
  >(null);
  const [editingProjectName, setEditingProjectName] = useState<string>("");
  const [activeColumn, setActiveColumn] = useState<UniqueIdentifier | null>(
    null
  );
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchProjectData = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.data.session.user.id)
        .eq("type", "group")
        .order("created_at", { ascending: true });

      if (projectError) {
        console.error(
          "Error al obtener proyectos grupales",
          projectError.message
        );
      } else {
        setProjectData(projects || []);
        if (projects && projects.length > 0) {
          setSelectedProjectId(projects[0].id);
          fetchTasks(projects[0].id);
        }
      }
    }
  };

  const fetchTasks = async (projectId: number) => {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("type")
      .eq("id", projectId)
      .single();

    if (projectError || project?.type !== "group") {
      console.error(
        "Proyecto no encontrado o no es grupal",
        projectError?.message
      );
      setTasks([]);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener tareas grupales", error.message);
    } else {
      setTasks(data || []);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  const handleAddTask = async () => {
    if (!task || !selectedProjectId) return;

    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const user = session.data.session.user;
      const validStatuses = ["todo", "inProgress", "done", "paused"];
      const statusToInsert = validStatuses.includes(taskStatus)
        ? taskStatus
        : "todo";

      const taskData = {
        task_name: task,
        project_id: selectedProjectId,
        user_id: user.id,
        task_status: statusToInsert,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select();

      if (error) {
        console.error("Error al agregar tarea grupal:", error);
      } else {
        setTasks((prevTasks) => [...prevTasks, ...data]);
        setTask("");
        setTaskStatus("todo");
        fetchTasks(selectedProjectId);
      }
    }
  };

  const handleAddProject = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const user = session.data.session.user;

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            project_name: newProjectName,
            project_description: newProjectDescription,
            user_id: user.id,
            type: "group", // Se guarda como grupal
          },
        ])
        .select();

      if (error) {
        console.error("Error al agregar proyecto grupal", error.message);
      } else {
        setProjectData((prevData) => [...prevData, ...data]);
        setNewProjectName("");
        setNewProjectDescription("");
        fetchProjectData();
      }
    }
  };

  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setTask("");
    setTaskStatus("todo");
    setSelectedTaskId(null);
    setEditingTaskName("");
    setSelectedProjectIdForEdit(null);
    setEditingProjectName("");
    fetchTasks(projectId);
  };

  const handleDeleteTask = async (taskId: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error al eliminar tarea grupal", error.message);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error al eliminar proyecto grupal", error.message);
    } else {
      setProjectData((prevData) =>
        prevData.filter((project) => project.id !== projectId)
      );
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setTasks([]);
      }
    }
  };

  const handleTaskEdit = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTaskId(task.id);
      setEditingTaskName(task.task_name);
    }
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskName(e.target.value);
  };

  const handleTaskNameSave = async (taskId: number) => {
    if (!editingTaskName.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .update({ task_name: editingTaskName })
      .eq("id", taskId);

    if (error) {
      console.error("Error al actualizar tarea grupal:", error.message);
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, task_name: editingTaskName } : t
        )
      );
      setSelectedTaskId(null);
      setEditingTaskName("");
      if (selectedProjectId) fetchTasks(selectedProjectId);
    }
  };

  const handleProjectEdit = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = projectData.find((p) => p.id === projectId);
    if (project) {
      setSelectedProjectIdForEdit(projectId);
      setEditingProjectName(project.project_name);
    }
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingProjectName(e.target.value);
  };

  const handleProjectNameSave = async (projectId: number) => {
    if (!editingProjectName.trim()) return;

    const { error } = await supabase
      .from("projects")
      .update({ project_name: editingProjectName })
      .eq("id", projectId);

    if (error) {
      console.error("Error al actualizar proyecto grupal", error.message);
    } else {
      setProjectData((prevData) =>
        prevData.map((p) =>
          p.id === projectId ? { ...p, project_name: editingProjectName } : p
        )
      );
      setSelectedProjectIdForEdit(null);
      setEditingProjectName("");
      fetchProjectData();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag started:", event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const validStatuses = ["todo", "inProgress", "done", "paused"];
      const destinationColumn: UniqueIdentifier = over.id;

      if (validStatuses.includes(destinationColumn.toString())) {
        setActiveColumn(destinationColumn);
      } else {
        const task = tasks.find((t) => t.id === Number(destinationColumn));
        if (task) {
          setActiveColumn(task.task_status);
        } else {
          setActiveColumn(null);
        }
      }
    } else {
      setActiveColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);

    if (!over) return;

    const taskId: UniqueIdentifier = active.id;
    const sourceColumn: UniqueIdentifier =
      active.data.current?.sortable?.containerId;
    const destinationColumn: UniqueIdentifier = over.id;

    const validStatuses = ["todo", "inProgress", "done", "paused"];
    let finalDestinationColumn: string;

    if (validStatuses.includes(destinationColumn.toString())) {
      finalDestinationColumn = destinationColumn.toString();
    } else {
      const task = tasks.find((t) => t.id === Number(destinationColumn));
      if (task) {
        finalDestinationColumn = task.task_status;
      } else {
        return;
      }
    }

    if (sourceColumn === finalDestinationColumn) return;

    const taskIdNumber = Number(taskId);
    const { error } = await supabase
      .from("tasks")
      .update({ task_status: finalDestinationColumn })
      .eq("id", taskIdNumber);

    if (error) {
      console.error("Error al actualizar el estado de la tarea grupal:", error);
    } else {
      if (selectedProjectId) fetchTasks(selectedProjectId);
    }
  };

  const filteredTasks = (status: string) => {
    return tasks.filter(
      (task: Task) => (task.task_status || "todo") === status
    );
  };

  return (
    <>
      <button
        onClick={() => router.push("/auth-pages/dashboard")}
        className="fixed top-12 left-6 bg-primary text-white py-2 px-4 rounded-lg shadow-lg hover:bg-[#DFDED4] transition-all z-50"
      >
        Volver
      </button>
      <div className="bg-[#DFDED4] p-6 min-h-screen flex relative">
        <div className="w-1/4 p-4 bg-white shadow-lg rounded-lg mr-6">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Proyectos Grupales
          </h2>
          {projectData.length > 0 ? (
            <ul>
              {projectData.map((project: Project) => (
                <li
                  key={project.id}
                  className={`p-2 mb-2 rounded-lg cursor-pointer ${
                    selectedProjectId === project.id
                      ? "bg-primary text-white"
                      : "bg-[#f5f5f5] text-black"
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="flex justify-between items-center">
                    {selectedProjectIdForEdit === project.id ? (
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={handleProjectNameChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleProjectNameSave(project.id);
                        }}
                        onBlur={() => handleProjectNameSave(project.id)}
                        className="p-1 w-3/4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    ) : (
                      <span className="w-3/4">{project.project_name}</span>
                    )}
                    <div className="dropdown dropdown-bottom dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn m-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        ...
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm"
                      >
                        <li>
                          <button
                            onClick={(e) => handleProjectEdit(project.id, e)}
                            className="block text-primary mb-2"
                          >
                            Editar Proyecto
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="block text-red-500"
                          >
                            Eliminar Proyecto
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tienes proyectos grupales</p>
          )}
          <div className="mt-6">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nombre del Proyecto Grupal"
              className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Descripción"
              className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAddProject}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
            >
              Añadir Proyecto Grupal
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {selectedProjectId
              ? "Tareas Grupales"
              : "Selecciona un Proyecto Grupal"}
          </h2>

          {selectedProjectId ? (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Añadir tarea grupal"
                  className="p-2 w-full mb-2 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
                />
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="p-2 w-full mb-4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
                >
                  <option value="todo">Lista de Tareas</option>
                  <option value="inProgress">En Progreso</option>
                  <option value="done">Hecho</option>
                  <option value="paused">Pausadas</option>
                </select>
                <button
                  onClick={handleAddTask}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
                >
                  Añadir Tarea Grupal
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-4 gap-4">
                  {["todo", "inProgress", "done", "paused"].map((status) => (
                    <DroppableColumn
                      key={status}
                      status={status}
                      tasks={filteredTasks(status)}
                      activeColumn={activeColumn}
                      selectedTaskId={selectedTaskId}
                      editingTaskName={editingTaskName}
                      handleTaskNameChange={handleTaskNameChange}
                      handleTaskNameSave={handleTaskNameSave}
                      handleTaskEdit={handleTaskEdit}
                      handleDeleteTask={handleDeleteTask}
                    />
                  ))}
                </div>
              </DndContext>
            </div>
          ) : (
            <p className="text-center text-primary">
              Selecciona un proyecto grupal para ver las tareas.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
