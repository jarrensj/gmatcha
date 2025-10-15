'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BulletInputProps {
  bullets: string[];
  onBulletsChange: (bullets: string[]) => void;
  placeholder?: string;
  onCurrentInputChange?: (input: string) => void;
}

interface SortableBulletItemProps {
  bullet: string;
  index: number;
  id: string;
  isEditing: boolean;
  editValue: string;
  onStartEdit: (index: number) => void;
  onSaveEdit: () => void;
  onDelete: (index: number) => void;
  onEditValueChange: (value: string) => void;
  onEditKeyPress: (e: React.KeyboardEvent) => void;
}

function SortableBulletItem({
  bullet,
  index,
  id,
  isEditing,
  editValue,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditValueChange,
  onEditKeyPress,
}: SortableBulletItemProps) {
  const editRef = useRef<HTMLInputElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 group ${isDragging ? 'z-50 bg-white shadow-lg rounded-md border' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing mt-1 p-1 rounded hover:bg-gray-100 transition-colors"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>
      <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2" />
      {isEditing ? (
        <Input
          ref={editRef}
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onKeyDown={onEditKeyPress}
          onBlur={onSaveEdit}
          className="flex-1"
        />
      ) : (
        <>
          <span className="flex-1 text-sm leading-relaxed mt-0.5">{bullet}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartEdit(index)}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function BulletInput({ bullets, onBulletsChange, placeholder = "Type a bullet point...", onCurrentInputChange }: BulletInputProps) {
  const [currentInput, setCurrentInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = bullets.findIndex((_, index) => `bullet-${index}` === active.id);
      const newIndex = bullets.findIndex((_, index) => `bullet-${index}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBullets = arrayMove(bullets, oldIndex, newIndex);
        onBulletsChange(newBullets);
        
        // Update editing index if the currently edited item was moved
        if (editingIndex === oldIndex) {
          setEditingIndex(newIndex);
        } else if (editingIndex !== null) {
          if (oldIndex < editingIndex && newIndex >= editingIndex) {
            setEditingIndex(editingIndex - 1);
          } else if (oldIndex > editingIndex && newIndex <= editingIndex) {
            setEditingIndex(editingIndex + 1);
          }
        }
      }
    }
  };

  const handleAddBullet = () => {
    if (currentInput.trim()) {
      onBulletsChange([...bullets, currentInput.trim()]);
      setCurrentInput('');
      onCurrentInputChange?.('');
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={bullets.map((_, index) => `bullet-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <SortableBulletItem
                  key={`bullet-${index}`}
                  id={`bullet-${index}`}
                  bullet={bullet}
                  index={index}
                  isEditing={editingIndex === index}
                  editValue={editValue}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDeleteBullet}
                  onEditValueChange={setEditValue}
                  onEditKeyPress={handleEditKeyPress}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Input for new bullet */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
              onCurrentInputChange?.(e.target.value);
            }}
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
