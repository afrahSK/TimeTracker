import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [session, setSession] = useState(null);

  const fetchSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id);
    if (error) console.error(error.message);
    else setProjects(data);
  };

  const handleAddProject = async () => {
    if (!projectName.trim()) return;
    const { data, error } = await supabase.from('projects').insert([
      { name: projectName, user_id: session.user.id },
    ]);
    if (error) console.error(error.message);
    else {
      setProjectName('');
      fetchProjects();
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) fetchProjects();
  }, [session]);

  return (
    <div className="project-section">
      <h2>Projects</h2>
      <input
        type="text"
        placeholder="Add project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <button onClick={handleAddProject}>Add Project</button>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
