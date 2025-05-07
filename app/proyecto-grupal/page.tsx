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
  assigned_to?: string;
}

interface Project {
  id: number;
  project_name: string;
  user_id: string;
  type: string;
  created_at: string;
}

interface User {
  email: string;
  display_name?: string;
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
  handleAssignTask: (taskId: number) => void;
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
  handleAssignTask: (taskId: number) => void;
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
  handleAssignTask,
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
                handleAssignTask={handleAssignTask}
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
    handleAssignTask,
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
        title={task.assigned_to || "No asignada"}
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
            <li>
              <button
                onClick={() => handleAssignTask(task.id)}
                className="block text-primary mb-2"
              >
                Asignar Tarea
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
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [editingMemberEmail, setEditingMemberEmail] = useState<string | null>(
    null
  );
  const [tempEmail, setTempEmail] = useState<string>("");
  const [tempDisplayName, setTempDisplayName] = useState<string>("");
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

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error(
          "Error al obtener el email del usuario:",
          userError.message,
          userError.details
        );
        return;
      }

      if (!userData) {
        console.error("No user data found for ID:", userId);
        return;
      }

      const userEmail = userData.email;
      setCurrentUserEmail(userEmail);
      console.log(`Fetching projects for user: ${userEmail}`);

      const { data: ownedProjects, error: ownedProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "group");

      if (ownedProjectsError) {
        console.error(
          "Error al obtener proyectos propios:",
          ownedProjectsError.message,
          ownedProjectsError.details
        );
        return;
      }

      const { data: projectMemberships, error: membershipError } =
        await supabase
          .from("project_users")
          .select("project_id")
          .eq("user_email", userEmail);

      if (membershipError) {
        console.error(
          "Error al obtener membresías de proyectos:",
          membershipError.message,
          membershipError.details
        );
        return;
      }

      const projectIds =
        projectMemberships?.map((membership) => membership.project_id) || [];
      console.log(`Project IDs from memberships for ${userEmail}:`, projectIds);

      let allProjectIds: number[] = [...projectIds];

      if (ownedProjects) {
        const ownedProjectIds = ownedProjects.map((p) => p.id);
        const uniqueProjectIds = new Set([
          ...allProjectIds,
          ...ownedProjectIds,
        ]);
        allProjectIds = Array.from(uniqueProjectIds);
      }

      console.log(`All Project IDs for ${userEmail}:`, allProjectIds);

      if (allProjectIds.length === 0) {
        console.log(`No projects found for ${userEmail}`);
        setProjectData([]);
        return;
      }

      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .in("id", allProjectIds)
        .eq("type", "group");

      if (projectError) {
        console.error(
          "Error al obtener proyectos:",
          projectError.message,
          projectError.details
        );
      } else {
        console.log(`Raw projects fetched for ${userEmail}:`, projects);
        if (projects && projects.length > 0) {
          setProjectData(projects);
          if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
            fetchTasks(projects[0].id);
            fetchProjectMembers(projects[0].id);
          }
        } else {
          setProjectData([]);
        }
      }
    }
  };

  const fetchTasks = async (projectId: number) => {
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

    if (userError) {
      console.error(
        "Error al obtener el email del usuario:",
        userError.message,
        userError.details
      );
      setTasks([]);
      return;
    }

    if (!userData) {
      console.error("No user data found for ID:", userId);
      setTasks([]);
      return;
    }

    const userEmail = userData.email;

    const { data: membership, error: membershipError } = await supabase
      .from("project_users")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_email", userEmail);

    const { data: ownedProject, error: ownedProjectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId);

    if (
      (membershipError || !membership || membership.length === 0) &&
      (ownedProjectError || !ownedProject || ownedProject.length === 0)
    ) {
      console.error(
        "Usuario no tiene acceso al proyecto o error:",
        membershipError?.message,
        membershipError?.details,
        ownedProjectError?.message
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
        "Proyecto no encontrado o no es grupal:",
        projectError?.message,
        projectError?.details
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
        "Error al obtener tareas grupales:",
        error.message,
        error.details
      );
    } else {
      console.log(`Tasks fetched for project ${projectId}:`, data);
      setTasks(
        data.map((task) => ({
          ...task,
          assigned_to: task.assigned_to || undefined,
        })) || []
      );
    }
  };

  const fetchUserByEmail = async (email: string) => {
    setSearchResults([]);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
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
        "Error al obtener el email del usuario actual:",
        currentUserError?.message,
        currentUserError?.details
      );
      return;
    }

    const currentUserEmail = currentUser.email;

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .neq("email", currentUserEmail);

    if (error) {
      console.error(
        "Error al buscar usuario por email:",
        error.message,
        error.details
      );
    } else if (data && data.length > 0) {
      setSearchResults(data);
    }
  };

  const fetchProjectUsers = async (projectId: number) => {
    setSearchResults([]);
    if (!projectId) {
      console.log("No project ID provided for fetchProjectUsers");
      return;
    }

    const session = await supabase.auth.getSession();
    if (!session.data?.session?.user) {
      console.log("No user session found in fetchProjectUsers");
      return;
    }

    const currentUserId = session.data.session.user.id;
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("email")
      .eq("id", currentUserId)
      .single();

    if (currentUserError || !currentUser) {
      console.error(
        "Error al obtener el email del usuario actual:",
        currentUserError?.message,
        currentUserError?.details
      );
      return;
    }

    const currentUserEmail = currentUser.email;
    setCurrentUserEmail(currentUserEmail);
    console.log(
      `Step 1: Fetching users for project ID ${projectId}, current user: ${currentUserEmail}`
    );

    const { data: projectUsers, error: projectUsersError } = await supabase
      .from("project_users")
      .select("user_email, display_name")
      .eq("project_id", projectId);

    if (projectUsersError) {
      console.error(
        "Step 2: Error al obtener usuarios del proyecto:",
        projectUsersError.message,
        projectUsersError.details
      );
      return;
    }

    console.log(
      `Step 2: Project users for project ID ${projectId}:`,
      projectUsers
    );

    const userList = projectUsers.map((pu) => ({
      email: pu.user_email,
      display_name: pu.display_name || undefined,
    }));
    console.log(
      `Step 5: Using emails and display_names for project ID ${projectId}:`,
      userList
    );
    setSearchResults(userList);
  };

  const fetchProjectMembers = async (projectId: number) => {
    setProjectMembers([]);
    if (!projectId) {
      console.log("No project ID provided for fetchProjectMembers");
      return;
    }

    const { data: members, error } = await supabase
      .from("project_users")
      .select("user_email, display_name")
      .eq("project_id", projectId);

    if (error) {
      console.error(
        "Error al obtener los miembros del proyecto:",
        error.message,
        error.details
      );
      return;
    }

    const memberList = members.map((member) => ({
      email: member.user_email,
      display_name: member.display_name || undefined,
    }));
    console.log(`Members for project ID ${projectId}:`, memberList);
    setProjectMembers(memberList);
  };

  const handleAddUserToProject = async (userEmail: string) => {
    if (!selectedProjectId) {
      setErrorMessage("No se ha seleccionado un proyecto");
      return;
    }

    const session = await supabase.auth.getSession();
    if (!session.data?.session?.user) {
      setErrorMessage("No hay sesión de usuario activa");
      return;
    }

    const currentUserId = session.data.session.user.id;

    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("email")
      .eq("id", currentUserId)
      .single();

    if (currentUserError || !currentUser) {
      console.error(
        "Error al obtener el email del usuario actual:",
        currentUserError?.message,
        currentUserError?.details
      );
      setErrorMessage("Error al obtener el email del usuario actual");
      return;
    }

    const currentUserEmail = currentUser.email;

    const { data: selectedUserMembership, error: selectedUserError } =
      await supabase
        .from("project_users")
        .select("*")
        .eq("project_id", selectedProjectId)
        .eq("user_email", userEmail);

    if (selectedUserError) {
      console.error(
        "Error al verificar membresía del usuario seleccionado:",
        selectedUserError.message,
        selectedUserError?.details
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

    const recordsToInsert = [];
    if (!selectedUserMembership || selectedUserMembership.length === 0) {
      recordsToInsert.push({
        project_id: selectedProjectId,
        user_email: userEmail,
      });
    }

    if (recordsToInsert.length > 0) {
      console.log(
        `Intentando insertar en project_users: ${JSON.stringify(recordsToInsert)}`
      );
      const { error: insertError } = await supabase
        .from("project_users")
        .insert(recordsToInsert);

      if (insertError) {
        console.error(
          "Error al añadir usuario al proyecto:",
          insertError.message,
          insertError.details
        );
        setErrorMessage(
          `Error al añadir usuario al proyecto: ${insertError.message}`
        );
        return;
      }
    }

    console.log(
      `Usuario ${userEmail} añadido al proyecto ${selectedProjectId} con éxito`
    );
    await fetchProjectData();
    await fetchProjectMembers(selectedProjectId);
    setIsModalOpen(false);
    setSearchEmail("");
    setSearchResults([]);
    setErrorMessage("");
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      setErrorMessage("El nombre del proyecto no puede estar vacío");
      return;
    }

    const session = await supabase.auth.getSession();

    if (!session.data?.session?.user) {
      setErrorMessage("No hay sesión de usuario activa");
      return;
    }

    const user = session.data.session.user;

    const projectData = {
      project_name: newProjectName,
      user_id: user.id,
      type: "group",
      created_at: new Date().toISOString(),
    };

    console.log("Intentando crear proyecto con datos:", projectData);

    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert([projectData])
      .select()
      .single();

    if (projectError) {
      console.error(
        "Error al agregar proyecto grupal:",
        projectError.message,
        projectError.details
      );
      setErrorMessage(`Error al crear proyecto: ${projectError.message}`);
      return;
    }

    console.log("Proyecto creado con éxito:", newProject);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error(
        "Error al obtener el email del usuario:",
        userError?.message,
        userError?.details
      );
      setErrorMessage("Error al obtener el email del usuario");
      await supabase.from("projects").delete().eq("id", newProject.id);
      console.log(
        `Proyecto ${newProject.id} eliminado debido a error al obtener email`
      );
      return;
    }

    const userEmail = userData.email;

    const membershipData = { project_id: newProject.id, user_email: userEmail };
    console.log(
      "Intentando añadir creador al proyecto con datos:",
      membershipData
    );

    const { error: membershipError } = await supabase
      .from("project_users")
      .insert([membershipData]);

    if (membershipError) {
      console.error(
        "Error al añadir usuario al proyecto:",
        membershipError.message,
        membershipError.details
      );
      setErrorMessage(
        `Error al añadir usuario al proyecto: ${membershipError.message}`
      );
      await supabase.from("projects").delete().eq("id", newProject.id);
      console.log(
        `Proyecto ${newProject.id} eliminado debido a error en membresía`
      );
      return;
    }

    console.log("Creador añadido al proyecto con éxito");
    setNewProjectName("");
    setErrorMessage("");
    await fetchProjectData();
  };

  const handleEditMember = (member: User) => {
    setEditingMemberEmail(member.email);
    setTempEmail(member.email);
    setTempDisplayName(member.display_name || "");
  };

  const handleCancelEdit = () => {
    setEditingMemberEmail(null);
    setTempEmail("");
    setTempDisplayName("");
  };

  const handleSaveMember = async () => {
    if (!selectedProjectId || !editingMemberEmail) return;

    if (!tempEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
      setErrorMessage("Por favor, ingresa un correo electrónico válido");
      return;
    }

    // Check for unique display_name
    if (tempDisplayName) {
      const { data: existingDisplayName, error: displayNameError } =
        await supabase
          .from("project_users")
          .select("user_email")
          .eq("project_id", selectedProjectId)
          .eq("display_name", tempDisplayName)
          .neq("user_email", editingMemberEmail);

      if (displayNameError) {
        console.error(
          "Error al verificar apodo existente:",
          displayNameError.message,
          displayNameError.details
        );
        setErrorMessage("Error al verificar el apodo");
        return;
      }

      if (existingDisplayName && existingDisplayName.length > 0) {
        setErrorMessage("Este apodo ya está en uso en el proyecto");
        return;
      }
    }

    const { data: existingMember, error: existingError } = await supabase
      .from("project_users")
      .select("user_email")
      .eq("project_id", selectedProjectId)
      .eq("user_email", tempEmail)
      .neq("user_email", editingMemberEmail);

    if (existingError) {
      console.error(
        "Error al verificar email existente:",
        existingError.message,
        existingError.details
      );
      setErrorMessage("Error al verificar el correo electrónico");
      return;
    }

    if (existingMember && existingMember.length > 0) {
      setErrorMessage("Este correo ya está en uso en el proyecto");
      return;
    }

    const { error } = await supabase
      .from("project_users")
      .update({
        user_email: tempEmail,
        display_name: tempDisplayName || null,
      })
      .eq("project_id", selectedProjectId)
      .eq("user_email", editingMemberEmail);

    if (error) {
      console.error(
        "Error al actualizar miembro:",
        error.message,
        error.details
      );
      setErrorMessage("Error al guardar los cambios");
      return;
    }

    if (editingMemberEmail === currentUserEmail) {
      setCurrentUserEmail(tempEmail);
    }

    setEditingMemberEmail(null);
    setTempEmail("");
    setTempDisplayName("");
    setErrorMessage("");
    await fetchProjectMembers(selectedProjectId);
  };

  useEffect(() => {
    fetchProjectData();

    const subscription = supabase
      .channel("project_users_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_users" },
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

            if (userData && payload.new.user_email === userData.email) {
              console.log(`Refreshing project data for ${userData.email}`);
              await fetchProjectData();
              if (selectedProjectId) {
                await fetchProjectMembers(selectedProjectId);
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "project_users" },
        async (payload) => {
          console.log("Real-time UPDATE detected in project_users:", payload);
          if (
            selectedProjectId &&
            payload.new.project_id === selectedProjectId
          ) {
            await fetchProjectMembers(selectedProjectId);
          }
        }
      )
      .subscribe();

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
        console.error(
          "Error al agregar tarea grupal:",
          error.message,
          error.details
        );
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
    setEditingMemberEmail(null);
    fetchTasks(projectId);
    fetchProjectMembers(projectId);
  };

  const handleDeleteTask = async (taskId: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error(
        "Error al eliminar tarea grupal:",
        error.message,
        error.details
      );
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
      console.error(
        "Error al eliminar proyecto grupal:",
        error.message,
        error.details
      );
    } else {
      setProjectData((prevData) =>
        prevData.filter((project) => project.id !== projectId)
      );
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setTasks([]);
        setProjectMembers([]);
        setEditingMemberEmail(null);
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
      console.error(
        "Error al actualizar tarea grupal:",
        error.message,
        error.details
      );
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
      console.error(
        "Error al actualizar proyecto grupal:",
        error.message,
        error.details
      );
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
      console.error(
        "Error al actualizar el estado de la tarea grupal:",
        error.message,
        error.details
      );
    } else {
      if (selectedProjectId) fetchTasks(selectedProjectId);
    }
  };

  const filteredTasks = (status: string) => {
    return tasks.filter(
      (task: Task) => (task.task_status || "todo") === status
    );
  };

  const handleAssignTask = (taskId: number) => {
    setAssigningTaskId(taskId);
    setIsModalOpen(true);
    if (selectedProjectId) {
      fetchProjectUsers(selectedProjectId);
    }
  };

  const handleAssignUserToTask = async (userEmail: string) => {
    if (!assigningTaskId || !selectedProjectId) return;

    const { error } = await supabase
      .from("tasks")
      .update({ assigned_to: userEmail })
      .eq("id", assigningTaskId);

    if (error) {
      console.error("Error al asignar tarea:", error.message, error.details);
      setErrorMessage("Error al asignar la tarea");
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === assigningTaskId ? { ...t, assigned_to: userEmail } : t
        )
      );
      setAssigningTaskId(null);
      setIsModalOpen(false);
      setSearchEmail("");
      setSearchResults([]);
      setErrorMessage("");
      await fetchTasks(selectedProjectId);
    }
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
            <button
              onClick={handleAddProject}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#DFDED4] transition-all"
            >
              Añadir Proyecto Grupal
            </button>
            {errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p>
            )}
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
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Miembros del Proyecto
                </h3>
                {projectMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {projectMembers.map((member) => (
                      <motion.div
                        key={member.email}
                        className="flex items-center bg-[#f5f5f5] rounded-full px-4 py-2 shadow-sm transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {editingMemberEmail === member.email ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="email"
                              value={tempEmail}
                              onChange={(e) => setTempEmail(e.target.value)}
                              placeholder="Correo electrónico"
                              className="p-1 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary rounded"
                            />
                            <input
                              type="text"
                              value={tempDisplayName}
                              onChange={(e) =>
                                setTempDisplayName(e.target.value)
                              }
                              placeholder="Apodo (opcional)"
                              className="p-1 border border-primary bg-[#f5f5f5] text-primary focus:outline-none focus:border-primary rounded"
                            />
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={handleSaveMember}
                                className="bg-primary text-white px-3 py-1 rounded hover:bg-[#DFDED4] transition-all"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <span className="text-primary text-sm font-medium">
                                {member.display_name || member.email}
                              </span>
                              {member.email === currentUserEmail && (
                                <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                                  (Tú)
                                </span>
                              )}
                            </div>
                            {member.email === currentUserEmail && (
                              <button
                                onClick={() => handleEditMember(member)}
                                className="ml-2 text-primary hover:text-primary/70 transition-all"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay miembros en este proyecto.
                  </p>
                )}
              </div>

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
                      handleAssignTask={handleAssignTask}
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
              {assigningTaskId ? "Asignar Tarea" : "Añadir Persona"}
            </h3>
            {assigningTaskId ? (
              <>
                <p className="text-gray-600 mb-4">
                  Selecciona un usuario del proyecto para asignar la tarea:
                </p>
                {searchResults.length > 0 ? (
                  <ul className="max-h-40 overflow-y-auto mb-4">
                    {searchResults.map((user) => (
                      <li
                        key={user.email}
                        className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${
                          user.email === currentUserEmail ? "bg-yellow-200" : ""
                        }`}
                        onClick={() => handleAssignUserToTask(user.email)}
                      >
                        {user.display_name || user.email}
                        {user.email === currentUserEmail && " (Tú)"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 mb-4">
                    No hay usuarios en este proyecto para asignar. Añade más
                    personas al proyecto.
                  </p>
                )}
              </>
            ) : (
              <>
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
                  <p className="text-center text-red-500 mb-4">
                    {errorMessage}
                  </p>
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
                    {searchEmail &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)
                      ? "Ingresa un correo válido"
                      : searchEmail
                        ? "Correo no encontrado"
                        : "Ingresa un correo para buscar"}
                  </p>
                )}
              </>
            )}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSearchEmail("");
                setSearchResults([]);
                setErrorMessage("");
                setAssigningTaskId(null);
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
