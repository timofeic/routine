'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const AVATAR_EMOJIS = [
  '👦', '👧', '🧒', '👶', '🧑', '👨', '👩',
  '🧔', '👱‍♂️', '👱‍♀️', '🦰', '🦱', '🦳', '🦲',
  '😀', '😃', '😄', '😁', '😊', '🙂', '😇',
  '🥰', '😍', '🤩', '😎', '🤓', '🧐', '🤠',
  '🥳', '🤡', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙',
  '🧙‍♀️', '🧝', '🧝‍♀️', '🧛', '🧛‍♀️', '🧟', '🧞',
  '🧜', '🧜‍♀️', '🧚', '🧚‍♀️', '👼', '🎅', '🤶',
  '🦄', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
  '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦉', '🦅', '🦇', '🐺', '🐗', '🐴', '🦓',
  '🦒', '🦘', '🦙', '🐘', '🦏', '🦛', '🦍',
  '🐢', '🦎', '🐊', '🐍', '🐲', '🐉', '🦕',
  '🦖', '🦀', '🦞', '🦐', '🦑', '🐙', '🐠',
  '🐟', '🐡', '🐬', '🐳', '🐋', '🦈', '⭐',
  '✨', '🌟', '💫', '🔥', '💧', '🌈', '🦋',
];

export function EmojiPicker({ selectedEmoji, onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose an Avatar</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Emoji Grid */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 88px)' }}>
          <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className={`
                  flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition-all
                  hover:scale-110 hover:bg-gray-100
                  ${selectedEmoji === emoji ? 'bg-blue-100 ring-4 ring-blue-400' : 'bg-gray-50'}
                `}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

