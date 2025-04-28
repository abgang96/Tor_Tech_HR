import { useState, memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import ProgressCircle from '../ui/ProgressCircle';
import api from '../../lib/api';
import EditOKRForm from '../forms/EditOKRForm';
import EditTaskForm from '../forms/EditTaskForm';

const OKRNode = ({ data, isConnectable }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [showEditOKRForm, setShowEditOKRForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Fetch users list when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Fetch assigned users for this OKR
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!data?.okr_id || !isExpanded) return;
      
      setIsLoadingUsers(true);
      try {
        // Use the new endpoint we added for getting assigned users
        const usersData = await api.getOKRAssignedUsers(data.okr_id);
        setAssignedUsers(usersData);
      } catch (error) {
        console.error('Error fetching assigned users:', error);
        // Fallback to just showing assigned_users_details if already in the data
        if (data.assigned_users_details && data.assigned_users_details.length > 0) {
          setAssignedUsers(data.assigned_users_details);
        } else {
          setAssignedUsers([]);
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    if (isExpanded) {
      fetchAssignedUsers();
    }
  }, [data.okr_id, isExpanded, data.assigned_users_details]);
  
  // Fetch users and departments for edit forms
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [usersData, departmentsData, okrsData, businessUnitsData] = await Promise.all([
          api.getUsers(),
          api.getDepartments(),
          api.getOKRs(),
          api.getBusinessUnits()
        ]);
        setUsers(usersData);
        setDepartments(departmentsData);
        setOkrs(okrsData);
        setBusinessUnits(businessUnitsData);
        console.log('Fetched business units:', businessUnitsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    
    if (showEditOKRForm || showEditTaskForm) {
      fetchFormData();
    }
  }, [showEditOKRForm, showEditTaskForm]);
  
  // Fetch tasks from the real API
  const fetchTasks = async () => {
    setIsTaskLoading(true);
    try {
      console.log('Fetching tasks for OKR ID:', data.okr_id);
      const taskData = await api.getOKRTasks(data.okr_id);
      console.log('Tasks received:', taskData);
      setTasks(taskData);
      setIsTaskLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsTaskLoading(false);
    }
  };
  
  const toggleTasks = () => {
    if (!showTasks && tasks.length === 0) {
      fetchTasks();
    }
    setShowTasks(!showTasks);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case true:
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Started':
      case false:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display (backend returns YYYY-MM-DD format)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Simple format, can use date-fns for more complex formatting
    return dateString;
  };
  
  // Handle edit OKR form submission
  const handleEditOKR = async (formData) => {
    try {
      const updatedOKR = await api.updateOKR(formData.okrId, formData);
      // Update the node data with the updated OKR info
      alert('OKR updated successfully!');
      setShowEditOKRForm(false);
      
      // Properly update all data properties to trigger re-render
      if (data.okr_id === updatedOKR.okr_id) {
        // Force a re-render by making sure all fields are properly updated
        data.progress_percent = updatedOKR.progress_percent;
        data.name = updatedOKR.name;
        data.description = updatedOKR.description;
        data.status = updatedOKR.status;
        data.due_date = updatedOKR.due_date;
        data.assumptions = updatedOKR.assumptions;
        
        // For React to detect the change, we need to force a state update
        // by creating a new reference
        setIsExpanded(false);
        setTimeout(() => setIsExpanded(true), 10);
      }
      
      // Update assigned users if they were included in the response
      if (updatedOKR.assigned_users_details) {
        setAssignedUsers(updatedOKR.assigned_users_details);
      }
    } catch (error) {
      console.error('Error updating OKR:', error);
      alert('Failed to update OKR. Please try again.');
    }
  };
  
  // Handle edit task form submission
  const handleEditTask = async (formData) => {
    try {
      const updatedTask = await api.updateTask(formData.task_id, formData);
      // Update the task in the tasks list
      setTasks(tasks.map(task => 
        task.task_id === formData.task_id ? updatedTask : task
      ));
      alert('Task updated successfully!');
      setShowEditTaskForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  useEffect(() => {
    if (isExpanded && data?.okr_id) {
      // If assigned_users_details is available, use it directly
      if (data.assigned_users_details && data.assigned_users_details.length > 0) {
        setAssignedUsers(data.assigned_users_details);
      }
    }
  }, [isExpanded, data]);

  // Handle continuing iteration of an OKR
  const handleContinueIteration = async () => {
    try {
      // Clone the OKR with a new iteration
      const newOKRData = {
        name: data.name,
        description: data.description,
        parent_okr_id: data.parent_okr_id,
        due_date: null, // Reset due date for new iteration
        status: 'Not Started',
        progress_percent: 0,
        assumptions: data.assumptions,
        isMeasurable: data.isMeasurable,
        previous_iteration_id: data.okr_id // Link to previous iteration
      };
      
      const createdOKR = await api.createOKR(newOKRData);
      
      // Copy assigned users from the current OKR to the new iteration
      if (assignedUsers && assignedUsers.length > 0) {
        const userAssignments = assignedUsers.map(user => ({
          okr_id: createdOKR.okr_id,
          user_id: user.user_id,
          is_primary: user.is_primary
        }));
        
        await Promise.all(userAssignments.map(assignment => 
          api.assignUserToOKR(assignment)
        ));
      }
      
      alert('New iteration created successfully! Refresh to see changes.');
      
      // Optional: Force a refresh of the OKR tree to show the new iteration
      if (data.onContinueIteration) {
        data.onContinueIteration(createdOKR);
      }
    } catch (error) {
      console.error('Error creating new iteration:', error);
      alert('Failed to create new iteration. Please try again.');
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className={`okr-node ${typeof data.status === 'boolean' ? (data.status ? 'active' : 'inactive') : data.status?.toLowerCase()?.replace(' ', '-')} 
          ${data.isSelected || data.isChildOfSelected ? 'border-2' : 'border'}
          ${data.borderColor || 'border-gray-300'}`}
        style={{
          borderColor: data.isSelected || data.isChildOfSelected ? 
            (data.borderColor ? data.borderColor.replace('border-', '').replace('-500', '') : 'blue') : 
            'gray'
        }}
      >
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900 truncate" title={data.name || data.title}>
              {data.name || data.title}
            </h4>
            {data.isMeasurable && (
              <div className="h-8 w-8">
                <ProgressCircle 
                  progress={data.progress_percent || data.progressPercent} 
                  size={30} 
                  strokeWidth={4} 
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span className={`px-2 py-1 rounded-full ${getStatusColor(data.status)}`}>
              {typeof data.status === 'boolean' ? (data.status ? 'Active' : 'Inactive') : data.status}
            </span>
            <span>Due: {formatDate(data.due_date || data.dueDate)}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 border-t pt-3">
            <p className="text-sm text-gray-600 mb-3">
              {data.description}
            </p>
            
            {data.assumptions && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Assumptions:</h5>
                <p className="text-sm text-gray-600">
                  {data.assumptions}
                </p>
              </div>
            )}
            
            {/* Assigned Users Section */}
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">Assigned to:</h5>
              {isLoadingUsers ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : assignedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.map(user => (
                    <div 
                      key={user.user_id}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${user.is_primary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {user.name}
                      {user.is_primary && (
                        <span className="ml-1 text-xs">★</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  No users assigned
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditOKRForm(true);
                }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Edit
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTasks();
                }}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                {showTasks ? 'Hide Tasks' : 'View Tasks'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Would you like to continue iterating on this OKR?')) {
                    handleContinueIteration();
                  }
                }}
                className="text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded"
              >
                Continue to iterate?
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this objective?')) {
                    alert('Delete OKR: ' + (data.okr_id || data.okrId));
                  }
                }}
                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        )}
        
        {/* Tasks section */}
        {showTasks && (
          <div className="mt-3 border-t pt-3">
            <h5 className="font-medium text-sm mb-2">Tasks</h5>
            
            {isTaskLoading ? (
              <div className="text-center py-3 text-sm text-gray-500">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-3 text-sm text-gray-500">
                No tasks found for this objective.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tasks.map(task => (
                  <div 
                    key={task.task_id} 
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                      setShowEditTaskForm(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{task.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {typeof task.status === 'boolean' ? (task.status ? 'Active' : 'Inactive') : task.status}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Progress: {task.progress_percent}%</span>
                      <span>Due: {formatDate(task.due_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {data.isLeafNode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Add Task to OKR: ' + (data.okr_id || data.okrId));
                }}
                className="mt-2 w-full text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200"
              >
                + Add Task
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Edit OKR Form Modal */}
      {showEditOKRForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Edit OKR: {data.name || data.title}
            </h3>
            <EditOKRForm 
              okrData={{...data, assigned_users_details: assignedUsers}}
              users={users}
              departments={departments}
              businessUnits={businessUnits}
              onSubmit={handleEditOKR}
              onCancel={() => setShowEditOKRForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Edit Task Form Modal */}
      {showEditTaskForm && selectedTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Edit Task: {selectedTask.title}
            </h3>
            <EditTaskForm 
              taskData={selectedTask}
              users={users}
              okrs={okrs}
              onSubmit={handleEditTask}
              onCancel={() => {
                setShowEditTaskForm(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default memo(OKRNode);