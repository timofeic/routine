'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

type Category = {
  name: string;
  icon: string;
  emojis: string[];
};

const EMOJI_CATEGORIES: Category[] = [
  {
    name: 'People',
    icon: '👤',
    emojis: [
      '👦', '👧', '🧒', '👶', '🧑', '👨', '👩',
      '🧔', '👱‍♂️', '👱‍♀️', '🦰', '🦱', '🦳', '🦲',
      '😀', '😃', '😄', '😁', '😊', '🙂', '😇',
      '🥰', '😍', '🤩', '😎', '🤓', '🧐', '🤠',
      '🥳', '🤡', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙',
      '🧙‍♀️', '🧝', '🧝‍♀️', '🧛', '🧛‍♀️', '🧟', '🧞',
      '🧜', '🧜‍♀️', '🧚', '🧚‍♀️', '👼', '🎅', '🤶',
    ],
  },
  {
    name: 'Animals',
    icon: '🐶',
    emojis: [
      '🦄', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
      '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
      '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
      '🦉', '🦅', '🦇', '🐺', '🐗', '🐴', '🦓',
      '🦒', '🦘', '🦙', '🐘', '🦏', '🦛', '🦍',
      '🐢', '🦎', '🐊', '🐍', '🐲', '🐉', '🦕',
      '🦖', '🦀', '🦞', '🦐', '🦑', '🐙', '🐠',
      '🐟', '🐡', '🐬', '🐳', '🐋', '🦈', '🦋',
    ],
  },
  {
    name: 'Clothing',
    icon: '👕',
    emojis: [
      '👕', '👔', '👗', '👘', '👚', '👙', '🩱',
      '🩲', '🩳', '👖', '🧥', '🧦', '🧤', '🧣',
      '🎩', '🧢', '👒', '🎓', '👑', '👟', '👞',
      '🥾', '👠', '👡', '👢', '🩴', '👓', '🕶️',
    ],
  },
  {
    name: 'Hygiene',
    icon: '🪥',
    emojis: [
      '🚽', '🛁', '🚿', '🪥', '🧴', '🧼', '🧽',
      '🧹', '🧺', '🪣', '🧻', '🪒', '💄', '💅',
      '💊', '💉', '🩹', '🩺', '🌡️', '😷', '🤧',
      '🤕', '🧘', '💆', '💇', '🛀',
    ],
  },
  {
    name: 'Food',
    icon: '🍕',
    emojis: [
      '🍳', '🥞', '🥐', '🍞', '🥖', '🥯', '🧇',
      '🥓', '🥚', '🧀', '🥗', '🥙', '🌮', '🌯',
      '🍕', '🍔', '🍟', '🌭', '🥪', '🍝', '🍜',
      '🍲', '🍱', '🍛', '🍙', '🍚', '🍥', '🍣',
      '🍿', '🥤', '🧃', '🧋', '🥛', '☕', '🍵',
    ],
  },
  {
    name: 'School',
    icon: '🎒',
    emojis: [
      '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖍️',
      '📕', '📗', '📘', '📙', '🎒', '🎓', '✅',
      '📋', '📌', '📍', '🖇️', '📎', '📐', '📏',
    ],
  },
  {
    name: 'Sports',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉',
      '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍',
      '🏏', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋',
      '🎽', '🛹', '🛼', '🛴', '🚴', '🤸', '🏊',
    ],
  },
  {
    name: 'Nature',
    icon: '🌳',
    emojis: [
      '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️',
      '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️',
      '💨', '🌪️', '🌫️', '🌈', '☔', '⚡', '🌙',
      '⭐', '✨', '🌟', '💫', '🌍', '🌎', '🌏',
      '🌱', '🌿', '🍀', '🌳', '🌲', '🌴', '🌵',
      '🌾', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀',
    ],
  },
  {
    name: 'Time',
    icon: '⏰',
    emojis: [
      '⏰', '⏱️', '⏲️', '🕐', '🕑', '🕒', '🕓',
      '🕔', '🕕', '🕖', '🕗', '🕘', '🛏️', '🛌',
    ],
  },
  {
    name: 'Toys',
    icon: '🧸',
    emojis: [
      '🧸', '🪀', '🪁', '🎮', '🎯', '🎲', '🧩',
      '🪆', '♟️', '🎨', '🖼️', '🎭', '🎪', '🎡',
    ],
  },
  {
    name: 'Music',
    icon: '🎵',
    emojis: [
      '🎵', '🎶', '🎤', '🎧', '🎸', '🎹', '🎺',
      '🎷', '🥁', '🎻', '🪕', '🎬', '🎭', '🩰',
    ],
  },
  {
    name: 'Travel',
    icon: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓',
      '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🚲',
      '🛴', '🛵', '🏍️', '🚇', '🚊', '🚝', '🚞',
      '🚃', '🚋', '🚟', '🚠', '🚡', '✈️', '🛫',
      '🛬', '🚁', '🛶', '⛵', '🚤', '🛥️', '⛴️',
    ],
  },
  {
    name: 'Other',
    icon: '🎉',
    emojis: [
      '🔥', '💧', '💦', '🧊', '🎁', '🎀', '🎉',
      '🎊', '🎈', '🏆', '🥇', '🥈', '🥉', '🏅',
      '💝', '💖', '💗', '💓', '💞', '💕', '💟',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎',
    ],
  },
];

export function EmojiPicker({ selectedEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const currentEmojis = EMOJI_CATEGORIES[selectedCategory].emojis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose an Emoji</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b-2 border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {EMOJI_CATEGORIES.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(index)}
                className={`
                  flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all
                  ${
                    selectedCategory === index
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Grid */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 180px)' }}>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {currentEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className={`
                  flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-all
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

