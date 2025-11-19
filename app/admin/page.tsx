'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EmojiPicker } from '@/components/EmojiPicker';
import { addKid, updateKid, deleteKid, addTask, updateTask, deleteTask, reorderTasks } from '@/lib/storage';
import { Kid, Task, RoutineType } from '@/lib/types';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data, updateData, isLoading } = useLocalStorage();
  const router = useRouter();
  const [editingKid, setEditingKid] = useState<Kid | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskType, setNewTaskType] = useState<RoutineType>('morning');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerFor, setEmojiPickerFor] = useState<'kid' | 'task' | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const handleAddKid = () => {
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
    const avatars = ['👦', '👧', '🧒', '👶', '🧑', '👨', '👩'];

    const newKid: Kid = {
      id: Date.now().toString(),
      name: 'New Child',
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
    };

    updateData(addKid(data, newKid));
    setEditingKid(newKid);
  };

  const handleUpdateKid = (kid: Kid) => {
    updateData(updateKid(data, kid.id, kid));
    setEditingKid(null);
  };

  const handleDeleteKid = (kidId: string) => {
    if (confirm('Are you sure you want to delete this child? This will also delete all their records.')) {
      updateData(deleteKid(data, kidId));
    }
  };

  const handleAddTask = () => {
    const morningTasks = data.tasks.filter((t: Task) => t.routineType === 'morning');
    const eveningTasks = data.tasks.filter((t: Task) => t.routineType === 'evening');
    const maxOrder = newTaskType === 'morning'
      ? Math.max(...morningTasks.map((t: Task) => t.order), 0)
      : Math.max(...eveningTasks.map((t: Task) => t.order), 0);

    const newTask: Task = {
      id: Date.now().toString(),
      name: 'New Task',
      icon: '✅',
      routineType: newTaskType,
      order: maxOrder + 1,
    };

    updateData(addTask(data, newTask));
    setEditingTask(newTask);
    setIsAddingTask(false);
  };

  const handleUpdateTask = (task: Task) => {
    updateData(updateTask(data, task.id, task));
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task? This will also delete all associated records.')) {
      updateData(deleteTask(data, taskId));
    }
  };

  const handleMoveTask = (task: Task, direction: 'up' | 'down') => {
    const tasksOfType = data.tasks
      .filter((t: Task) => t.routineType === task.routineType)
      .sort((a: Task, b: Task) => a.order - b.order);

    const index = tasksOfType.findIndex((t: Task) => t.id === task.id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === tasksOfType.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reorderedIds = [...tasksOfType];
    [reorderedIds[index], reorderedIds[newIndex]] = [reorderedIds[newIndex], reorderedIds[index]];

    updateData(reorderTasks(data, task.routineType, reorderedIds.map((t: Task) => t.id)));
  };

  const morningTasks = data.tasks.filter((t: Task) => t.routineType === 'morning').sort((a: Task, b: Task) => a.order - b.order);
  const eveningTasks = data.tasks.filter((t: Task) => t.routineType === 'evening').sort((a: Task, b: Task) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-white p-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-8 w-8 text-gray-800" />
            </Link>
            <h1 className="text-5xl font-black text-white drop-shadow-lg">Settings</h1>
          </div>
        </div>

        <div className="space-y-8">
          {/* Kids Management */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Children</h2>
              <button
                onClick={handleAddKid}
                className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Add Child
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {data.kids.map((kid: Kid) => (
                <div key={kid.id} className="rounded-2xl border-2 border-gray-200 p-4">
                  {editingKid?.id === kid.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingKid.name}
                        onChange={(e) => setEditingKid({ ...editingKid, name: e.target.value })}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-xl font-bold"
                        placeholder="Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEmojiPickerFor('kid');
                          setShowEmojiPicker(true);
                        }}
                        className="w-full rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-center text-6xl transition-colors hover:bg-blue-100"
                      >
                        {editingKid.avatar || '👤'}
                      </button>
                      <p className="text-center text-sm text-gray-600">Click to change avatar</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateKid(editingKid)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold"
                        >
                          <Save className="h-5 w-5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingKid(null)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-white font-bold"
                        >
                          <X className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{kid.avatar}</span>
                        <span className="text-2xl font-bold text-gray-900">{kid.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingKid(kid)}
                          className="rounded-full bg-blue-500 p-3 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKid(kid.id)}
                          className="rounded-full bg-red-500 p-3 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Morning Tasks */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Morning Tasks</h2>
              <button
                onClick={() => {
                  setNewTaskType('morning');
                  setIsAddingTask(true);
                  handleAddTask();
                }}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {morningTasks.map((task: Task, index: number) => (
                <div key={task.id} className="rounded-2xl border-2 border-gray-200 p-4">
                  {editingTask?.id === task.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmojiPickerFor('task');
                            setShowEmojiPicker(true);
                          }}
                          className="w-20 rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-center text-3xl transition-colors hover:bg-blue-100"
                        >
                          {editingTask.icon || '✅'}
                        </button>
                        <input
                          type="text"
                          value={editingTask.name}
                          onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-xl"
                          placeholder="Task name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTask(editingTask)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold"
                        >
                          <Save className="h-5 w-5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-white font-bold"
                        >
                          <X className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{task.icon}</span>
                        <span className="text-xl font-semibold text-gray-900">{task.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveTask(task, 'up')}
                          disabled={index === 0}
                          className="rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMoveTask(task, 'down')}
                          disabled={index === morningTasks.length - 1}
                          className="rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="rounded-full bg-blue-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evening Tasks */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Evening Tasks</h2>
              <button
                onClick={() => {
                  setNewTaskType('evening');
                  setIsAddingTask(true);
                  handleAddTask();
                }}
                className="flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {eveningTasks.map((task: Task, index: number) => (
                <div key={task.id} className="rounded-2xl border-2 border-gray-200 p-4">
                  {editingTask?.id === task.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmojiPickerFor('task');
                            setShowEmojiPicker(true);
                          }}
                          className="w-20 rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-center text-3xl transition-colors hover:bg-blue-100"
                        >
                          {editingTask.icon || '✅'}
                        </button>
                        <input
                          type="text"
                          value={editingTask.name}
                          onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-xl"
                          placeholder="Task name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTask(editingTask)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold"
                        >
                          <Save className="h-5 w-5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-white font-bold"
                        >
                          <X className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{task.icon}</span>
                        <span className="text-xl font-semibold text-gray-900">{task.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveTask(task, 'up')}
                          disabled={index === 0}
                          className="rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMoveTask(task, 'down')}
                          disabled={index === eveningTasks.length - 1}
                          className="rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="rounded-full bg-blue-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <EmojiPicker
          selectedEmoji={emojiPickerFor === 'kid' ? editingKid?.avatar || '' : editingTask?.icon || ''}
          onSelect={(emoji) => {
            if (emojiPickerFor === 'kid' && editingKid) {
              setEditingKid({ ...editingKid, avatar: emoji });
            } else if (emojiPickerFor === 'task' && editingTask) {
              setEditingTask({ ...editingTask, icon: emoji });
            }
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}

