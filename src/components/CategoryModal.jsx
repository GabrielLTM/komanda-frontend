import React, { useState } from 'react';
import { X } from 'lucide-react';
import useAccessibleDialog from '../hooks/useAccessibleDialog';

export default function CategoryModal({
  categoryToEdit,
  categories,
  onClose,
  onSave,
  busy = false,
  error: serverError = '',
}) {
  const [name, setName] = useState(categoryToEdit ? categoryToEdit.name : '');
  const [tried, setTried] = useState(false);
  const { dialogRef, onKeyDown } = useAccessibleDialog(() => { if (!busy) onClose(); });

  const cleanName = name.trim();
  const isDuplicate = categories.some(
    (c) =>
      (!categoryToEdit || c.id !== categoryToEdit.id) &&
      c.name.trim().toLowerCase() === cleanName.toLowerCase()
  );

  const validationError = !tried
    ? ''
    : !cleanName
    ? 'Informe o nome da categoria.'
    : isDuplicate
    ? 'Já existe uma categoria com esse nome.'
    : '';

  const handleSave = async () => {
    if (!cleanName || isDuplicate) {
      setTried(true);
      return;
    }
    await onSave(categoryToEdit ? { ...categoryToEdit, name: cleanName } : { name: cleanName });
  };

  return (
    <div
      onClick={busy ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31,26,23,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        ref={dialogRef}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1ECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong id="category-dialog-title" style={{ fontSize: '18px', fontWeight: 800 }}>
            {categoryToEdit ? 'Editar categoria' : 'Nova categoria'}
          </strong>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Fechar"
            style={{ border: 0, background: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="category-name" style={{ fontSize: '13px', fontWeight: 700, color: '#4A423C' }}>Nome da categoria</label>
          <input
            id="category-name"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTried(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            maxLength={60}
            placeholder="Ex: Pastéis"
            style={{
              border: validationError ? '1px solid #C41F27' : '1px solid #E2DBD3',
              borderRadius: '8px',
              padding: '11px 12px',
              fontSize: '15px',
              outline: 'none',
            }}
          />
          <span role="alert" style={{ minHeight: '18px', fontSize: '12px', color: '#C41F27' }}>{validationError}</span>
          {serverError && <span role="alert" style={{ fontSize: '12px', color: '#8C141B' }}>{serverError}</span>}
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid #F1ECE6', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            style={{ border: '1px solid #E2DBD3', background: '#fff', borderRadius: '10px', padding: '11px 18px', fontSize: '14px', fontWeight: 700 }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            style={{ border: 0, background: '#C41F27', color: '#fff', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 800 }}
          >
            Salvar categoria
          </button>
        </div>
      </div>
    </div>
  );
}
