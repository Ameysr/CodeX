import React, { useState, useRef } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router';

const Resume = () => {
  const [resume, setResume] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    education: [{
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    }],
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    }],
    skills: [{
      category: '',
      items: ['']
    }],
    projects: [{
      name: '',
      technologies: [''],
      description: '',
      url: ''
    }],
    languages: [{
      language: '',
      proficiency: ''
    }]
  });
  
  const [activeTab, setActiveTab] = useState('edit');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [analysis, setAnalysis] = useState('');
  const [loadingImprovement, setLoadingImprovement] = useState({});
  const pdfRef = useRef(null);

  // Scrollbar styling for the whole page
  const scrollbarStyle = { 
    scrollbarWidth: 'thin', 
    scrollbarColor: '#374151 transparent' 
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleChange = (section, index, field, value) => {
    setResume(prev => {
      if (index === undefined || index === null) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      };
    });
  };

  const handleSkillChange = (categoryIndex, skillIndex, value) => {
    setResume(prev => {
      const newSkills = [...prev.skills];
      newSkills[categoryIndex] = {
        ...newSkills[categoryIndex],
        items: newSkills[categoryIndex].items.map((item, i) => 
          i === skillIndex ? value : item
        )
      };
      return { ...prev, skills: newSkills };
    });
  };

  const handleTechChange = (projectIndex, techIndex, value) => {
    setResume(prev => {
      const newProjects = [...prev.projects];
      newProjects[projectIndex] = {
        ...newProjects[projectIndex],
        technologies: newProjects[projectIndex].technologies.map((tech, i) => 
          i === techIndex ? value : tech
        )
      };
      return { ...prev, projects: newProjects };
    });
  };

  const addItem = (section) => {
    const templates = {
      education: {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      },
      experience: {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      },
      skills: {
        category: '',
        items: ['']
      },
      projects: {
        name: '',
        technologies: [''],
        description: '',
        url: ''
      },
      languages: {
        language: '',
        proficiency: ''
      }
    };
    
    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeItem = (section, index) => {
    if (resume[section].length <= 1) return;
    
    setResume(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addSkill = (categoryIndex) => {
    setResume(prev => {
      const newSkills = [...prev.skills];
      newSkills[categoryIndex] = {
        ...newSkills[categoryIndex],
        items: [...newSkills[categoryIndex].items, '']
      };
      return { ...prev, skills: newSkills };
    });
  };

  const removeSkill = (categoryIndex, skillIndex) => {
    if (resume.skills[categoryIndex].items.length <= 1) return;
    
    setResume(prev => {
      const newSkills = [...prev.skills];
      newSkills[categoryIndex] = {
        ...newSkills[categoryIndex],
        items: newSkills[categoryIndex].items.filter((_, i) => i !== skillIndex)
      };
      return { ...prev, skills: newSkills };
    });
  };

  const addTechnology = (projectIndex) => {
    setResume(prev => {
      const newProjects = [...prev.projects];
      newProjects[projectIndex] = {
        ...newProjects[projectIndex],
        technologies: [...newProjects[projectIndex].technologies, '']
      };
      return { ...prev, projects: newProjects };
    });
  };

  const removeTechnology = (projectIndex, techIndex) => {
    if (resume.projects[projectIndex].technologies.length <= 1) return;
    
    setResume(prev => {
      const newProjects = [...prev.projects];
      newProjects[projectIndex] = {
        ...newProjects[projectIndex],
        technologies: newProjects[projectIndex].technologies.filter((_, i) => i !== techIndex)
      };
      return { ...prev, projects: newProjects };
    });
  };

  // AI Improvement function
  const improveContent = async (section, index, field, currentContent) => {
    const key = `${section}_${index}_${field}`;
    setLoadingImprovement(prev => ({ ...prev, [key]: true }));
    
    try {
      // Call your actual AI improvement endpoint
      const response = await axiosClient.post('/interview/improve-content', {
        content: currentContent,
        section: section,
        field: field,
        context: resume
      });
      
      // Update the content with improved version
      handleChange(section, index, field, response.data.improvedContent);
      showNotification('Content improved successfully!', 'success');
      
    } catch (error) {
      console.error('Content improvement error:', error);
      showNotification('Failed to improve content. Please try again.', 'error');
    } finally {
      setLoadingImprovement(prev => ({ ...prev, [key]: false }));
    }
  };

  const downloadResume = () => {
    const element = document.createElement('a');
    const resumeData = JSON.stringify(resume, null, 2);
    const file = new Blob([resumeData], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${resume.personalInfo.name || 'resume'}_data.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Resume data downloaded successfully!', 'success');
  };

  const analyzeResume = async () => {
    try {
      setAnalysis('<div class="text-center p-8"><div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-400 rounded-full"></div><p class="mt-4 text-gray-300">Analyzing your resume with AI...</p></div>');
      setActiveTab('analysis');
      
      // Call actual analysis endpoint
      const response = await axiosClient.post('/interview/resume/analyze', resume);
      
      // Set analysis result
      setAnalysis(response.data.analysis);
      showNotification('Resume analyzed successfully!', 'success');
      
    } catch (error) {
      setAnalysis('<div class="text-center p-8"><p class="text-red-400">❌ Error analyzing resume. Please try again.</p></div>');
      showNotification('Error analyzing resume', 'error');
    }
  };

  // Client-side PDF generation function
  const generatePDF = () => {
    // Create the formatted resume HTML for PDF
    const resumeHTML = generateResumeHTML();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${resume.personalInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; color: black; }
            .resume { max-width: 800px; margin: 0 auto; }
            h1 { font-size: 28px; margin-bottom: 5px; }
            h2 { font-size: 18px; margin: 20px 0 10px 0; padding-bottom: 3px; border-bottom: 1px solid #ccc; }
            .contact-info { margin-bottom: 20px; }
            .contact-item { display: inline-block; margin-right: 20px; margin-bottom: 5px; }
            .section { margin-bottom: 25px; }
            .section-header { background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px; }
            .section-title { margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333; }
            .section-content { margin-left: 20px; }
            .experience-item, .education-item, .project-item { margin-bottom: 20px; }
            .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
            .item-title { font-size: 16px; font-weight: bold; color: #333; }
            .item-date { font-size: 14px; color: #333; font-weight: bold; white-space: nowrap; margin-left: 20px; }
            .item-subtitle { color: #333; font-size: 14px; margin-bottom: 5px; }
            .item-details { color: #333; font-size: 14px; }
            .skills-grid { display: flex; flex-wrap: wrap; gap: 40px; }
            .skills-category { flex: 1; min-width: 200px; }
            .skills-category-title { font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px; }
            .skill-item { margin-bottom: 2px; color: #333; font-size: 14px; }
            ul { margin: 0; padding-left: 20px; color: #333; font-size: 14px; }
            li { margin-bottom: 5px; }
            .tech-stack { font-size: 14px; color: #666; margin: 5px 0; }
            @media print { body { print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${resumeHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    showNotification('Resume PDF generated! Check your browser\'s print dialog.', 'success');
  };

const generateResumeHTML = () => {
  // Check if sections have content
  const hasExperience = resume.experience.some(exp => exp.company || exp.position);
  const hasEducation = resume.education.some(edu => edu.institution || edu.degree);
  const hasSkills = resume.skills.some(s => s.category && s.items.some(item => item.trim()));
  const hasProjects = resume.projects.some(p => p.name);
  const hasLanguages = resume.languages.some(l => l.language);
  
  // Helper function to extract domain name from URL
  const extractDomainName = (url) => {
    if (!url) return '';
    try {
      // Remove protocol if present
      let cleanUrl = url.replace(/^https?:\/\//, '');
      // Remove www. if present
      cleanUrl = cleanUrl.replace(/^www\./, '');
      // Get just the domain part (before any path)
      cleanUrl = cleanUrl.split('/')[0];
      return cleanUrl;
    } catch {
      return url;
    }
  };
  
  return `
    <div class="resume">
      <!-- Header Section -->
      <div style="text-align: left; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 15px;">
        <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 5px 0; color: #333; letter-spacing: 1px;">
          ${resume.personalInfo.name.toUpperCase() || 'YOUR NAME'}
        </h1>
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
          ${[
            resume.personalInfo.location,
            resume.personalInfo.email,
            resume.personalInfo.phone
          ].filter(Boolean).join(' | ')}
        </div>
        <div style="font-size: 14px; color: #666;">
          ${[
            resume.personalInfo.website && `<a href="${resume.personalInfo.website.startsWith('http') ? resume.personalInfo.website : 'https://' + resume.personalInfo.website}" target="_blank" style="color: #0066cc; text-decoration: none;">${extractDomainName(resume.personalInfo.website)}</a>`,
            resume.personalInfo.linkedin && `<a href="${resume.personalInfo.linkedin.startsWith('http') ? resume.personalInfo.linkedin : 'https://' + resume.personalInfo.linkedin}" target="_blank" style="color: #0066cc; text-decoration: none;">LinkedIn</a>`,
            resume.personalInfo.github && `<a href="${resume.personalInfo.github.startsWith('http') ? resume.personalInfo.github : 'https://' + resume.personalInfo.github}" target="_blank" style="color: #0066cc; text-decoration: none;">GitHub</a>`
          ].filter(Boolean).join(' | ')}
        </div>
      </div>

      <!-- Summary Section -->
      ${resume.personalInfo.summary ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">PROFESSIONAL SUMMARY</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            <p style="margin: 0; text-align: justify; line-height: 1.5; color: #333; font-size: 14px;">
              ${resume.personalInfo.summary}
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Technical Skills Section -->
      ${hasSkills ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">TECHNICAL SKILLS</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            <div class="skills-grid" style="display: flex; flex-wrap: wrap; gap: 40px;">
              ${resume.skills.filter(s => s.category && s.items.some(item => item.trim())).map(skillGroup => `
                <div class="skills-category" style="flex: 1; min-width: 200px;">
                  <div class="skills-category-title" style="font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px;">
                    ${skillGroup.category}
                  </div>
                  ${skillGroup.items.filter(item => item.trim()).map(skill => 
                    `<div class="skill-item" style="margin-bottom: 2px; color: #333; font-size: 14px;">${skill}</div>`
                  ).join('')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Professional Experience Section -->
      ${hasExperience ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">PROFESSIONAL EXPERIENCE</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            ${resume.experience.filter(exp => exp.company || exp.position).map(exp => `
              <div class="experience-item" style="margin-bottom: 20px;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <div class="item-title" style="font-size: 16px; font-weight: bold; color: #333;">${exp.company || 'Company Name'}</div>
                  <div class="item-date" style="font-size: 14px; color: #333; font-weight: bold; white-space: nowrap; margin-left: 20px;">
                    ${exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Start Date'} - ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'End Date')}
                  </div>
                </div>
                <div class="item-subtitle" style="color: #333; font-size: 14px; margin-bottom: 5px;">
                  <strong>${exp.position || 'Position Title'}</strong>
                </div>
                ${exp.description ? `
                  <ul class="item-details" style="margin: 0; padding-left: 20px; color: #333; font-size: 14px;">
                    ${exp.description.split('\n').filter(item => item.trim()).map(item => 
                      `<li style="margin-bottom: 5px;">${item.trim().replace(/^[•\-\*]\s*/, '')}</li>`
                    ).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education Section -->
      ${hasEducation ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">EDUCATION</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            ${resume.education.filter(edu => edu.institution || edu.degree).map(edu => `
              <div class="education-item" style="margin-bottom: 20px;">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <div class="item-title" style="font-size: 16px; font-weight: bold; color: #333;">
                    ${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}
                  </div>
                  <div class="item-date" style="font-size: 14px; color: #333; font-weight: bold; white-space: nowrap; margin-left: 20px;">
                    ${edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Start'} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'End'}
                  </div>
                </div>
                <div class="item-subtitle" style="color: #333; font-size: 14px; margin-bottom: 5px;">
                  ${edu.institution || 'Institution Name'}
                </div>
                <div class="item-details" style="color: #333; font-size: 14px;">
                  ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                  ${edu.description ? `<div>${edu.description}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects Section -->
      ${hasProjects ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">PROJECTS</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            ${resume.projects.filter(p => p.name).map(project => `
              <div class="project-item" style="margin-bottom: 20px;">
                <div class="item-title" style="font-size: 16px; font-weight: bold; color: #333;">${project.name}</div>
                ${project.technologies.some(t => t.trim()) ? `
                  <div class="tech-stack" style="font-size: 14px; color: #666; margin: 5px 0;">
                    <strong>Technologies:</strong> ${project.technologies.filter(t => t.trim()).join(', ')}
                  </div>
                ` : ''}
                ${project.description ? `<div class="item-details" style="color: #333; font-size: 14px;">${project.description}</div>` : ''}
                ${project.url ? `<div class="item-details" style="color: #0066cc; font-size: 14px;"><a href="${project.url.startsWith('http') ? project.url : 'https://' + project.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${project.url}</a></div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Languages Section -->
      ${hasLanguages ? `
        <div class="section">
          <div class="section-header" style="background-color: #e6e6e6; padding: 12px 20px; margin-bottom: 15px; border-radius: 20px;">
            <h2 class="section-title" style="margin: 0; font-size: 14px; font-weight: bold; font-style: italic; color: #333;">LANGUAGES</h2>
          </div>
          <div class="section-content" style="margin-left: 20px;">
            <div class="item-details" style="color: #333; font-size: 14px;">
              ${resume.languages.filter(l => l.language).map(lang => 
                `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`
              ).join(', ')}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

return (
  <div 
    className="min-h-screen custom-scrollbar bg-[#181C1F] text-gray-300" 
    style={scrollbarStyle}
  >
    {/* Custom scrollbar styling */}
    <style>{`
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #374151 transparent;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #374151;
        border-radius: 10px;
        border: 2px solid transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #4b5563;
      }
      
      input, textarea, select {
        border: 0.1px solid rgba(255, 255, 255, 0.3) !important;
        background-color: #181C1F;
      }
      
      input:focus, textarea:focus, select:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
    `}</style>

    {/* Top Navigation Bar */}
    <nav className="border-b border-gray-700 py-4 px-6 flex justify-between items-center shadow-lg bg-[#181C1F]">
      <NavLink
        to="/"
        className="text-3xl font-bold text-gray-300 hover:text-white transition-colors duration-200"
      >
        CodeX
      </NavLink>
      
      <div className="flex items-center gap-4">
        <NavLink 
          to="/home" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Problems
        </NavLink>

        <NavLink 
          to="/interview" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Virtual Interview
        </NavLink>

        <NavLink 
          to="/resume" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Resume Building
        </NavLink>

        <NavLink 
          to="/dashboard" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Dashboard
        </NavLink>

        <NavLink 
          to="/promote" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Promote
        </NavLink>
      </div>
    </nav>

    {/* Notification */}
    {notification.show && (
      <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl z-50 transition-all duration-300 ${
        notification.type === 'success' 
          ? 'bg-green-600 border border-green-500' 
          : 'bg-red-600 border border-red-500'
      } text-white`}>
        {notification.message}
      </div>
    )}

    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="rounded-xl p-6 shadow-lg mb-6 bg-[#181C1F] border border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-[white] to-purple-500 bg-clip-text text-transparent mb-2">
              Professional Resume Builder
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={analyzeResume}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analysis
            </button>
            <button 
              onClick={downloadResume}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Download Data
            </button>
            <button 
              onClick={generatePDF}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Generate PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="rounded-xl p-2 shadow-lg mb-6 bg-[#181C1F] border border-gray-700">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'edit', label: 'Edit Resume', icon: '✏️' },
            { id: 'analysis', label: 'AI Analysis', icon: '🤖' },
            { id: 'preview', label: 'Live Preview', icon: '👁️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'edit' && (
          <div className="rounded-xl p-6 shadow-lg bg-[#181C1F] border border-gray-700">
            {/* Personal Information Section */}
            <Section title="Personal Information" icon="👤">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InputField 
                  label="Full Name" 
                  value={resume.personalInfo.name} 
                  onChange={(e) => handleChange('personalInfo', null, 'name', e.target.value)}
                  placeholder="Full name"
                />
                <InputField 
                  label="Email" 
                  type="email" 
                  value={resume.personalInfo.email} 
                  onChange={(e) => handleChange('personalInfo', null, 'email', e.target.value)}
                  placeholder="example@email.com"
                />
                <InputField 
                  label="Phone" 
                  value={resume.personalInfo.phone} 
                  onChange={(e) => handleChange('personalInfo', null, 'phone', e.target.value)}
                  placeholder="+91 3334445556"
                />
                <InputField 
                  label="Location" 
                  value={resume.personalInfo.location} 
                  onChange={(e) => handleChange('personalInfo', null, 'location', e.target.value)}
                  placeholder="Banglore"
                />
                <InputField 
                  label="LinkedIn Profile" 
                  value={resume.personalInfo.linkedin} 
                  onChange={(e) => handleChange('personalInfo', null, 'linkedin', e.target.value)}
                  placeholder="linkedin.com/in/example"
                />
                <InputField 
                  label="GitHub Profile" 
                  value={resume.personalInfo.github} 
                  onChange={(e) => handleChange('personalInfo', null, 'github', e.target.value)}
                  placeholder="github.com/example"
                />
                <InputField 
                  label="Website" 
                  value={resume.personalInfo.website} 
                  onChange={(e) => handleChange('personalInfo', null, 'website', e.target.value)}
                  placeholder="www.example.com"
                />
              </div>
              <div className="mt-6">
                <TextAreaWithAI 
                  label="Professional Summary" 
                  value={resume.personalInfo.summary} 
                  onChange={(e) => handleChange('personalInfo', null, 'summary', e.target.value)}
                  placeholder="Experienced and results-driven professional with expertise in..."
                  rows={4}
                  onImprove={() => improveContent('personalInfo', null, 'summary', resume.personalInfo.summary)}
                  isLoading={loadingImprovement['personalInfo_null_summary']}
                />
              </div>
            </Section>

            {/* Work Experience Section */}
            <Section title="Work Experience" icon="💼" onAdd={() => addItem('experience')}>
              {resume.experience.map((exp, idx) => (
                <ItemCard key={idx} onRemove={() => removeItem('experience', idx)} canRemove={resume.experience.length > 1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <InputField 
                      label="Company" 
                      value={exp.company} 
                      onChange={(e) => handleChange('experience', idx, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                    <InputField 
                      label="Position" 
                      value={exp.position} 
                      onChange={(e) => handleChange('experience', idx, 'position', e.target.value)}
                      placeholder="Job Title"
                    />
                    <InputField 
                      label="Start Date" 
                      type="month" 
                      value={exp.startDate} 
                      onChange={(e) => handleChange('experience', idx, 'startDate', e.target.value)}
                    />
                    {!exp.current && (
                      <InputField 
                        label="End Date" 
                        type="month" 
                        value={exp.endDate} 
                        onChange={(e) => handleChange('experience', idx, 'endDate', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="flex items-center mb-4">
                    <input 
                      type="checkbox" 
                      checked={exp.current} 
                      onChange={(e) => handleChange('experience', idx, 'current', e.target.checked)}
                      className="mr-3 h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-gray-300">Currently working here</label>
                  </div>
                  <TextAreaWithAI 
                    label="Job Description" 
                    value={exp.description} 
                    onChange={(e) => handleChange('experience', idx, 'description', e.target.value)}
                    placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Include quantifiable results when possible"
                    rows={4}
                    onImprove={() => improveContent('experience', idx, 'description', exp.description)}
                    isLoading={loadingImprovement[`experience_${idx}_description`]}
                  />
                </ItemCard>
              ))}
            </Section>

            {/* Education Section */}
            <Section title="Education" icon="🎓" onAdd={() => addItem('education')}>
              {resume.education.map((edu, idx) => (
                <ItemCard key={idx} onRemove={() => removeItem('education', idx)} canRemove={resume.education.length > 1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <InputField 
                      label="Institution" 
                      value={edu.institution} 
                      onChange={(e) => handleChange('education', idx, 'institution', e.target.value)}
                      placeholder="University Name"
                    />
                    <InputField 
                      label="Degree" 
                      value={edu.degree} 
                      onChange={(e) => handleChange('education', idx, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                    />
                    <InputField 
                      label="Field of Study" 
                      value={edu.field} 
                      onChange={(e) => handleChange('education', idx, 'field', e.target.value)}
                      placeholder="Computer Science"
                    />
                    <InputField 
                      label="GPA (Optional)" 
                      value={edu.gpa} 
                      onChange={(e) => handleChange('education', idx, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                    <InputField 
                      label="Start Date" 
                      type="month" 
                      value={edu.startDate} 
                      onChange={(e) => handleChange('education', idx, 'startDate', e.target.value)}
                    />
                    <InputField 
                      label="End Date" 
                      type="month" 
                      value={edu.endDate} 
                      onChange={(e) => handleChange('education', idx, 'endDate', e.target.value)}
                    />
                  </div>
                  <TextAreaWithAI 
                    label="Additional Details (Optional)" 
                    value={edu.description} 
                    onChange={(e) => handleChange('education', idx, 'description', e.target.value)}
                    placeholder="Relevant coursework, honors, achievements..."
                    rows={3}
                    onImprove={() => improveContent('education', idx, 'description', edu.description)}
                    isLoading={loadingImprovement[`education_${idx}_description`]}
                  />
                </ItemCard>
              ))}
            </Section>

            {/* Skills Section */}
            <Section title="Skills" icon="⭐" onAdd={() => addItem('skills')}>
              {resume.skills.map((skillGroup, idx) => (
                <ItemCard key={idx} onRemove={() => removeItem('skills', idx)} canRemove={resume.skills.length > 1}>
                  <InputField 
                    label="Skill Category" 
                    value={skillGroup.category} 
                    onChange={(e) => handleChange('skills', idx, 'category', e.target.value)}
                    placeholder="e.g., Programming Languages, Marketing Tools"
                  />
                  <div className="mt-4">
                    <label className="block mb-3 font-medium text-gray-300">Skills</label>
                    {skillGroup.items.map((skill, skillIdx) => (
                      <div key={skillIdx} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(idx, skillIdx, e.target.value)}
                          className="flex-1 p-3 border rounded-lg bg-[#181C1F] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., JavaScript, Google Analytics"
                        />
                        {skillGroup.items.length > 1 && (
                          <button 
                            type="button" 
                            className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                            onClick={() => removeSkill(idx, skillIdx)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="mt-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => addSkill(idx)}
                    >
                      ➕ Add Skill
                    </button>
                  </div>
                </ItemCard>
              ))}
            </Section>

            {/* Projects Section */}
            <Section title="Projects" icon="🚀" onAdd={() => addItem('projects')}>
              {resume.projects.map((project, idx) => (
                <ItemCard key={idx} onRemove={() => removeItem('projects', idx)} canRemove={resume.projects.length > 1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <InputField 
                      label="Project Name" 
                      value={project.name} 
                      onChange={(e) => handleChange('projects', idx, 'name', e.target.value)}
                      placeholder="My Awesome Project"
                    />
                    <InputField 
                      label="Project URL (Optional)" 
                      value={project.url} 
                      onChange={(e) => handleChange('projects', idx, 'url', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-3 font-medium text-gray-300">Technologies Used</label>
                    {project.technologies.map((tech, techIdx) => (
                      <div key={techIdx} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleTechChange(idx, techIdx, e.target.value)}
                          className="flex-1 p-3 border rounded-lg bg-[#181C1F] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                        {project.technologies.length > 1 && (
                          <button 
                            type="button" 
                            className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            onClick={() => removeTechnology(idx, techIdx)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="mt-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => addTechnology(idx)}
                    >
                      ➕ Add Technology
                    </button>
                  </div>
                  <TextAreaWithAI 
                    label="Project Description" 
                    value={project.description} 
                    onChange={(e) => handleChange('projects', idx, 'description', e.target.value)}
                    placeholder="Describe what the project does, your role, and key achievements..."
                    rows={4}
                    onImprove={() => improveContent('projects', idx, 'description', project.description)}
                    isLoading={loadingImprovement[`projects_${idx}_description`]}
                  />
                </ItemCard>
              ))}
            </Section>

            {/* Languages Section */}
            <Section title="Languages" icon="🌍" onAdd={() => addItem('languages')}>
              {resume.languages.map((lang, idx) => (
                <ItemCard key={idx} onRemove={() => removeItem('languages', idx)} canRemove={resume.languages.length > 1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <InputField 
                      label="Language" 
                      value={lang.language} 
                      onChange={(e) => handleChange('languages', idx, 'language', e.target.value)}
                      placeholder="e.g., English, Spanish"
                    />
                    <div>
                      <label className="block mb-2 font-medium text-gray-300">Proficiency Level</label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => handleChange('languages', idx, 'proficiency', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-[#181C1F] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select proficiency</option>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                  </div>
                </ItemCard>
              ))}
            </Section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="rounded-xl p-6 shadow-lg bg-[#181C1F] border border-gray-700">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                AI Resume Analysis
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200"
                  onClick={() => setActiveTab('edit')}
                >
                  ← Back to Edit
                </button>
                <button
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200"
                  onClick={analyzeResume}
                >
                  🔄 Re-analyze
                </button>
              </div>
            </div>
            
            <div 
              className="prose max-w-none text-gray-300" 
              dangerouslySetInnerHTML={{ __html: analysis || '<div class="text-center p-8 text-gray-400">Click "AI Analysis" button to analyze your resume</div>' }} 
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="rounded-xl p-6 shadow-lg bg-[#181C1F] border border-gray-700">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Live Preview</h2>
              <button
                onClick={generatePDF}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200"
              >
                📄 Print/Save as PDF
              </button>
            </div>
            
            <div 
              ref={pdfRef}
              className="bg-white text-black p-8 rounded-lg shadow-xl mx-auto max-w-4xl"
              style={{ minHeight: '297mm' }}
              dangerouslySetInnerHTML={{ __html: generateResumeHTML() }}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
};

// Helper Components
const Section = ({ title, icon, children, onAdd }) => (
  <div className="mb-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>
      {onAdd && (
        <button 
          type="button" 
          onClick={onAdd} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ➕ Add {title.slice(0, -1)}
        </button>
      )}
    </div>
    {children}
  </div>
);

const ItemCard = ({ children, onRemove, canRemove }) => (
  <div 
    className="relative p-6 mb-6 rounded-xl shadow-lg" 
    style={{ 
      backgroundColor: "#1a1f2e", 
      border: "0.1px solid oklch(1 0 0 / 0.4)" 
    }}
  >
    {canRemove && (
      <button 
        type="button" 
        className="absolute top-4 right-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
        onClick={onRemove}
      >
        🗑️
      </button>
    )}
    {children}
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block mb-2 font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      placeholder={placeholder}
      style={{ border: "0.1px solid oklch(1 0 0 / 0.3)" }}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block mb-2 font-medium text-gray-300">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-[#181C1F] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
      rows={rows}
      placeholder={placeholder}
      style={{ border: "0.1px solid oklch(1 0 0 / 0.3)" }}
    />
  </div>
);

const TextAreaWithAI = ({ label, value, onChange, placeholder, rows = 3, onImprove, isLoading }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="block font-medium text-gray-300">{label}</label>
      <button
        type="button"
        onClick={onImprove}
        disabled={isLoading || !value?.trim()}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm"
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            Improving...
          </>
        ) : (
          <>
            <span>✨</span>
            AI Improve
          </>
        )}
      </button>
    </div>
    <textarea
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
      rows={rows}
      placeholder={placeholder}
      style={{ border: "0.1px solid oklch(1 0 0 / 0.3)" }}
    />
  </div>
);

export default Resume;