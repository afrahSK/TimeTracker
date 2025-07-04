import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) fetchProjects();
  }, [session]);

  const fetchSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  const fetchProjects = async () => {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (projectError) {
      console.error(projectError.message);
      return;
    }

    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('project_id, start_time, end_time');

    if (activityError) {
      console.error(activityError.message);
      return;
    }

    const projectDurations = {};

    activityData.forEach(({ project_id, start_time, end_time }) => {
      if (start_time && end_time && project_id) {
        const durationInSeconds = (new Date(end_time) - new Date(start_time)) / 1000;
        projectDurations[project_id] = (projectDurations[project_id] || 0) + durationInSeconds;
      }
    });

    const formatDuration = (totalSeconds) => {
      const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
    };

    const combined = projectData.map((proj) => ({
      ...proj,
      time_tracked: formatDuration(projectDurations[proj.id] || 0),
    }));

    setProjects(combined);
  };


  const handleAddProject = async () => {
    if (!projectName.trim()) return;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: projectName, user_id: session.user.id }]);
    if (error) console.error(error.message);
    else {
      setProjectName('');
      fetchProjects();
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="projects-wrapper">
      <div className="projects-top">
        <h2>📂 Your Projects</h2>
        <div className="projects-controls">
          <input
            type="text"
            className="project-input"
            placeholder="New project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <button className="btn-add-project" onClick={handleAddProject}>
            + Add
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by project name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="projects-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Time Tracked</th>
            <th>Date Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.length === 0 ? (
            <tr>
              <td colSpan="3">No projects found.</td>
            </tr>
          ) : (
            filteredProjects.map((project) => (
              <tr key={project.id}>
                <td className="name-cell">{project.name}</td>
                <td>{project.time_tracked} hrs</td>
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;
