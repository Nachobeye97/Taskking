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

interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
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
      const userId = session.data.session.user.id;

      // Fetch the user's email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        console.error(
          "Error al obtener el email del usuario",
          userError?.message
        );
        return;
      }

      const userEmail = userData.email;
      console.log(`Fetching projects for user: ${userEmail}`);

      // Fetch projects associated with the user's email via project_users
      const { data: projectMemberships, error: membershipError } =
        await supabase
          .from("project_users")
          .select("project_id")
          .eq("user_email", userEmail);

      if (membershipError) {
        console.error(
          "Error al obtener membresías de proyectos",
          membershipError.message
        );
        return;
      }

      const projectIds =
        projectMemberships?.map((membership) => membership.project_id) || [];
      console.log(`Project IDs for ${userEmail}:`, projectIds);

      if (projectIds.length === 0) {
        console.log(`No project memberships found for ${userEmail}`);
        return;
      }

      // Fetch project details with detailed logging
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds);

      if (projectError) {
        console.error(
          "Error al obtener proyectos:",
          projectError.message,
          projectError.details
        );
      } else {
        console.log(`Raw projects fetched for ${userEmail}:`, projects);
        if (projects && projects.length > 0) {
          const filteredProjects = projects.filter((p) => p.type === "group");
          console.log(`Filtered projects for ${userEmail}:`, filteredProjects);
          // Only update projectData if we have new data to avoid overwriting
          if (filteredProjects.length > 0) {
            setProjectData(filteredProjects);
            if (!selectedProjectId && filteredProjects.length > 0) {
              setSelectedProjectId(filteredProjects[0].id);
              fetchTasks(filteredProjects[0].id);
            }
          }
        } else {
          console.log(`No projects found in projects table for ${userEmail}`);
        }
      }
    }
  };

  const fetchTasks = async (projectId: number) => {
    // Verify the user is a member of the project
    const session = await supabase.auth.getSession();
    if (!session.data?.session?.user) {
      console.error("No user session found");
      setTasks([]);
      return;
    }

    const userId = session.data.session.user.id;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error(
        "Error al obtener el email del usuario",
        userError?.message
      );
      setTasks([]);
      return;
    }

    const userEmail = userData.email;

    const { data: membership, error: membershipError } = await supabase
      .from("project_users")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_email", userEmail);

    if (membershipError || !membership || membership.length === 0) {
      console.error(
        "Usuario no tiene acceso al proyecto o error:",
        membershipError?.message
      );
      setTasks([]);
      return;
    }

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
      console.error(
        "Error al obtener tareas grupales",
        error.message,
        error.details
      );
    } else {
      console.log(`Tasks fetched for project ${projectId}:`, data);
      setTasks(data || []);
    }
  };

  const fetchUserByEmail = async (email: string) => {
    setSearchResults([]); // Clear results initially
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return; // Only proceed if it's a valid email format
    }

    const session = await supabase.auth.getSession();
    if (!session.data?.session?.user) return;

    const currentUserId = session.data.session.user.id;
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("email")
      .eq("id", currentUserId)
      .single();

    if (currentUserError || !currentUser) {
      console.error(
        "Error al obtener el email del usuario actual",
        currentUserError?.message
      );
      return;
    }

    const currentUserEmail = currentUser.email;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email) // Exact match
      .neq("email", currentUserEmail); // Exclude the current user

    if (error) {
      console.error("Error al buscar usuario por email", error.message);
    } else if (data && data.length > 0) {
      setSearchResults(data);
    }
  };

  const handleAddUserToProject = async (userEmail: string) => {
    if (!selectedProjectId) return;

    const session = await supabase.auth.getSession();
    if (session.data?.session?.user) {
      const currentUserId = session.data.session.user.id;

      // Fetch the current user's email
      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("email")
        .eq("id", currentUserId)
        .single();

      if (currentUserError || !currentUser) {
        console.error(
          "Error al obtener el email del usuario actual",
          currentUserError?.message
        );
        setErrorMessage("Error al obtener el email del usuario actual");
        return;
      }

      const currentUserEmail = currentUser.email;

      // Check if the selected user is already in the project
      const { data: selectedUserMembership, error: selectedUserError } =
        await supabase
          .from("project_users")
          .select("*")
          .eq("project_id", selectedProjectId)
          .eq("user_email", userEmail);

      if (selectedUserError) {
        console.error(
          "Error al verificar membresía del usuario seleccionado",
          selectedUserError.message
        );
        setErrorMessage(
          "Error al verificar si el usuario ya está en el proyecto"
        );
        return;
      }

      if (selectedUserMembership && selectedUserMembership.length > 0) {
        setErrorMessage("El usuario ya está en el proyecto");
        return;
      }

      // Check if the current user is already in the project
      const { data: currentUserMembership, error: currentUserMembershipError } =
        await supabase
          .from("project_users")
          .select("*")
          .eq("project_id", selectedProjectId)
          .eq("user_email", currentUserEmail);

      if (currentUserMembershipError) {
        console.error(
          "Error al verificar membresía del usuario actual",
          currentUserMembershipError.message
        );
        setErrorMessage(
          "Error al verificar si el usuario actual está en el proyecto"
        );
        return;
      }

      const recordsToInsert = [];

      // Add the selected user if not already in the project
      if (!selectedUserMembership || selectedUserMembership.length === 0) {
        recordsToInsert.push({
          project_id: selectedProjectId,
          user_email: userEmail,
        });
      }

      // Add the current user if not already in the project
      if (!currentUserMembership || currentUserMembership.length === 0) {
        recordsToInsert.push({
          project_id: selectedProjectId,
          user_email: currentUserEmail,
        });
      }

      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("project_users")
          .insert(recordsToInsert);

        if (insertError) {
          console.error(
            "Error al añadir usuario al proyecto",
            insertError.message
          );
          setErrorMessage("Error al añadir usuario al proyecto");
          return;
        }
      }

      // Fetch updated project data for the current user
      await fetchProjectData();
      setIsModalOpen(false);
      setSearchEmail("");
      setSearchResults([]);
      setErrorMessage("");
    }
  };

  const handleAddProject = async () => {
    const session = await supabase.auth.getSession();

    if (session.data?.session?.user) {
      const user = session.data.session.user;

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            project_name: newProjectName,
            project_description: newProjectDescription,
            user_id: user.id,
            type: "group",
          },
        ])
        .select()
        .single();

      if (projectError) {
        console.error(
          "Error al agregar proyecto grupal",
          projectError.message,
          projectError.details
        );
      } else if (newProject) {
        console.log("New project created:", newProject);

        // Fetch the user's email
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("id", user.id)
          .single();

        if (userError || !userData) {
          console.error(
            "Error al obtener el email del usuario",
            userError?.message
          );
          return;
        }

        const userEmail = userData.email;

        // Add the user to the project_users table
        const { error: membershipError } = await supabase
          .from("project_users")
          .insert([{ project_id: newProject.id, user_email: userEmail }]);

        if (membershipError) {
          console.error(
            "Error al añadir usuario al proyecto",
            membershipError.message
          );
          return;
        }

        // Immediately add the new project to state to avoid fetch delays
        setProjectData((prevData) => [...prevData, newProject]);
        setNewProjectName("");
        setNewProjectDescription("");
        await fetchProjectData(); // Refresh to ensure consistency
      }
    }
  };

  useEffect(() => {
    // Initial fetch of project data
    fetchProjectData();

    // Subscribe to real-time changes in the project_users table
    const subscription = supabase
      .channel("project_users_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_users",
        },
        async (payload) => {
          console.log("Real-time INSERT detected in project_users:", payload);
          const session = await supabase.auth.getSession();
          if (session.data?.session?.user) {
            const userId = session.data.session.user.id;
            const { data: userData } = await supabase
              .from("users")
              .select("email")
              .eq("id", userId)
              .single();

            if (userData) {
              console.log(
                `Current user email: ${userData.email}, New record email: ${payload.new.user_email}`
              );
              if (payload.new.user_email === userData.email) {
                console.log(`Refreshing project data for ${userData.email}`);
                await fetchProjectData();
              }
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      console.log("Unsubscribing from project_users_changes");
      supabase.removeChannel(subscription);
    };
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
                        <li>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="block text-primary mb-2"
                          >
                            Añadir Persona
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold text-primary mb-4">
              Añadir Persona
            </h3>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => {
                const email = e.target.value;
                setSearchEmail(email);
                fetchUserByEmail(email);
              }}
              placeholder="Buscar por correo electrónico"
              className="p-2 w-full mb-4 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary"
            />
            {errorMessage && (
              <p className="text-center text-red-500 mb-4">{errorMessage}</p>
            )}
            {searchResults.length > 0 ? (
              <ul className="max-h-40 overflow-y-auto mb-4">
                {searchResults.map((user) => (
                  <li
                    key={user.email}
                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => handleAddUserToProject(user.email)}
                  >
                    {user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 mb-4">
                {searchEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)
                  ? "Ingresa un correo válido"
                  : searchEmail
                    ? "Correo no encontrado"
                    : "Ingresa un correo para buscar"}
              </p>
            )}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSearchEmail("");
                setSearchResults([]);
                setErrorMessage("");
              }}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
