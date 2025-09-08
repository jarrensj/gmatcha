'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Plus } from "lucide-react";

interface BulletInputProps {
  bullets: string[];
  onBulletsChange: (bullets: string[]) => void;
  placeholder?: string;
}

export function BulletInput({ bullets, onBulletsChange, placeholder = "Type a bullet point..." }: BulletInputProps) {
  const [currentInput, setCurrentInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && editRef.current) {
      editRef.current.focus();
    }
  }, [editingIndex]);

  const handleAddBullet = () => {
    if (currentInput.trim()) {
      onBulletsChange([...bullets, currentInput.trim()]);
      setCurrentInput('');
      // Focus back to input for continuous typing
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBullet();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(bullets[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newBullets = [...bullets];
      newBullets[editingIndex] = editValue.trim();
      onBulletsChange(newBullets);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDeleteBullet = (index: number) => {
    const newBullets = bullets.filter((_, i) => i !== index);
    onBulletsChange(newBullets);
  };

  return (
    <div className="space-y-3">
      {/* Existing bullets */}
      {bullets.length > 0 && (
        <div className="space-y-2">
          {bullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2" />
              {editingIndex === index ? (
                <Input
                  ref={editRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyPress}
                  onBlur={handleSaveEdit}
                  className="flex-1"
                />
              ) : (
                <>
                  <span className="flex-1 text-sm leading-relaxed mt-0.5">{bullet}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBullet(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input for new bullet */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
        </div>
        
        {/* Helper text directly under input */}
        <div className="text-[9px] text-muted-foreground/40">
          {currentInput.trim() ? (
            <span>Press Enter to add bullet point</span>
          ) : (
            <span>Type above to insert a bullet point item.</span>
          )}
        </div>
      </div>
    </div>
  );
}
