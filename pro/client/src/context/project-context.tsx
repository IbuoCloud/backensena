import React, { createContext, useContext, useState } from "react";
import CreateProjectDialog from "@/components/projects/create-project-dialog";

interface ProjectContextType {
  createNewProject: () => void;
  isCreatingProject: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const createNewProject = () => {
    setIsCreatingProject(true);
  };

  return (
    <ProjectContext.Provider
      value={{
        createNewProject,
        isCreatingProject
      }}
    >
      {children}
      <CreateProjectDialog 
        open={isCreatingProject} 
        onOpenChange={setIsCreatingProject}
      />
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  
  return context;
}
