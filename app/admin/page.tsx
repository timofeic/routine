'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EmojiPicker } from '@/components/EmojiPicker';
import { addKid, updateKid, deleteKid, addRoutine, updateRoutine, deleteRoutine, addTask, updateTask, deleteTask, reorderTasks } from '@/lib/storage';
import { Kid, Task, Routine } from '@/lib/types';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data, updateData, isLoading } = useLocalStorage();
  const router = useRouter();
  const [editingKid, setEditingKid] = useState<Kid | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('morning');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerFor, setEmojiPickerFor] = useState<'kid' | 'routine' | 'task' | null>(null);

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

  const handleAddRoutine = () => {
    const colors = [
      'from-red-400 to-orange-400',
      'from-green-400 to-teal-400',
      'from-cyan-400 to-blue-400',
      'from-violet-400 to-purple-400',
      'from-pink-400 to-rose-400',
    ];

    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: 'New Routine',
      icon: '⭐',
      color: colors[Math.floor(Math.random() * colors.length)],
      isDefault: false,
    };

    updateData(addRoutine(data, newRoutine));
    setEditingRoutine(newRoutine);
  };

  const handleUpdateRoutine = (routine: Routine) => {
    updateData(updateRoutine(data, routine.id, routine));
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (routineId: string) => {
    const routine = data.routines.find(r => r.id === routineId);
    if (routine?.isDefault) {
      alert('Cannot delete default routines (Morning and Evening)');
      return;
    }
    if (confirm('Are you sure you want to delete this routine? This will also delete all tasks and records associated with it.')) {
      updateData(deleteRoutine(data, routineId));
      if (selectedRoutineId === routineId) {
        setSelectedRoutineId('morning');
      }
    }
  };

  const handleAddTask = () => {
    const routineTasks = data.tasks.filter((t: Task) => t.routineId === selectedRoutineId);
    const maxOrder = Math.max(...routineTasks.map((t: Task) => t.order), 0);

    const newTask: Task = {
      id: Date.now().toString(),
      name: 'New Task',
      icon: '✅',
      routineId: selectedRoutineId,
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
    const tasksOfRoutine = data.tasks
      .filter((t: Task) => t.routineId === task.routineId)
      .sort((a: Task, b: Task) => a.order - b.order);

    const index = tasksOfRoutine.findIndex((t: Task) => t.id === task.id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === tasksOfRoutine.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reorderedIds = [...tasksOfRoutine];
    [reorderedIds[index], reorderedIds[newIndex]] = [reorderedIds[newIndex], reorderedIds[index]];

    updateData(reorderTasks(data, task.routineId, reorderedIds.map((t: Task) => t.id)));
  };

  const selectedRoutineTasks = data.tasks.filter((t: Task) => t.routineId === selectedRoutineId).sort((a: Task, b: Task) => a.order - b.order);
  const selectedRoutine = data.routines.find((r: Routine) => r.id === selectedRoutineId);

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
          {/* Routines Management */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Routines</h2>
              <button
                onClick={handleAddRoutine}
                className="flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Add Routine
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.routines.map((routine: Routine) => (
                <div key={routine.id} className="rounded-2xl border-2 border-gray-200 p-4">
                  {editingRoutine?.id === routine.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingRoutine.name}
                        onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-xl font-bold"
                        placeholder="Routine Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEmojiPickerFor('routine');
                          setShowEmojiPicker(true);
                        }}
                        className="w-full rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-center text-6xl transition-colors hover:bg-blue-100"
                      >
                        {editingRoutine.icon || '⭐'}
                      </button>
                      <p className="text-center text-sm text-gray-600">Click to change icon</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRoutine(editingRoutine)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold"
                        >
                          <Save className="h-5 w-5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRoutine(null)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-500 px-4 py-2 text-white font-bold"
                        >
                          <X className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={`mb-3 flex items-center justify-center rounded-xl bg-gradient-to-br ${routine.color} p-6`}>
                        <span className="text-6xl drop-shadow-lg">{routine.icon}</span>
                      </div>
                      <div className="text-center mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{routine.name}</h3>
                        {routine.isDefault && (
                          <span className="text-xs text-gray-500">Default</span>
                        )}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setEditingRoutine(routine)}
                          className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        {!routine.isDefault && (
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="flex items-center justify-center rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
                          className="flex items-center justify-center rounded-full bg-blue-500 p-3 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKid(kid.id)}
                          className="flex items-center justify-center rounded-full bg-red-500 p-3 text-white transition-transform hover:scale-105 active:scale-95"
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

          {/* Task Management by Routine */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tasks</h2>

              {/* Routine Selector */}
              <div className="mb-6 flex flex-wrap gap-3">
                {data.routines.map((routine: Routine) => (
                  <button
                    key={routine.id}
                    onClick={() => setSelectedRoutineId(routine.id)}
                    className={`flex items-center gap-2 rounded-full px-6 py-3 text-lg font-bold shadow-md transition-all ${
                      selectedRoutineId === routine.id
                        ? `bg-gradient-to-r ${routine.color} text-white scale-105`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{routine.icon}</span>
                    {routine.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-700">
                  {selectedRoutine?.name} Tasks
                </h3>
                <button
                  onClick={handleAddTask}
                  className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${selectedRoutine?.color || 'from-gray-400 to-gray-500'} px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95`}
                >
                  <Plus className="h-6 w-6" />
                  Add Task
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {selectedRoutineTasks.map((task: Task, index: number) => (
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
                          className="flex items-center justify-center rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMoveTask(task, 'down')}
                          disabled={index === selectedRoutineTasks.length - 1}
                          className="flex items-center justify-center rounded-full bg-gray-300 p-2 text-gray-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="flex items-center justify-center rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-105 active:scale-95"
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

          {/* Danger Zone */}
          <div className="rounded-3xl border-4 border-red-300 bg-red-100 p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-red-900 mb-4">⚠️ Danger Zone</h2>
            <p className="text-lg text-red-800 mb-6">
              Clearing all data will permanently delete all children, routines, tasks, and records.
              This action cannot be undone.
            </p>
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  '⚠️ WARNING: This will permanently delete ALL data including:\n\n' +
                  '• All children\n' +
                  '• All routines (including custom ones)\n' +
                  '• All tasks\n' +
                  '• All completion records\n' +
                  '• All personal bests\n' +
                  '• All world records\n\n' +
                  'This action CANNOT be undone!\n\n' +
                  'Are you absolutely sure you want to continue?'
                );

                if (confirmed) {
                  const doubleCheck = window.confirm(
                    '🚨 FINAL CONFIRMATION 🚨\n\n' +
                    'This is your last chance!\n\n' +
                    'Click OK to DELETE ALL DATA or Cancel to keep your data.'
                  );

                  if (doubleCheck) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }
              }}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-12 py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-700 active:scale-95 min-w-[300px]"
            >
              <Trash2 className="h-6 w-6 flex-shrink-0" />
              <span>Clear All Data</span>
            </button>
          </div>

        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <EmojiPicker
          selectedEmoji={
            emojiPickerFor === 'kid' ? editingKid?.avatar || '' :
            emojiPickerFor === 'routine' ? editingRoutine?.icon || '' :
            editingTask?.icon || ''
          }
          onSelect={(emoji) => {
            if (emojiPickerFor === 'kid' && editingKid) {
              setEditingKid({ ...editingKid, avatar: emoji });
            } else if (emojiPickerFor === 'routine' && editingRoutine) {
              setEditingRoutine({ ...editingRoutine, icon: emoji });
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

