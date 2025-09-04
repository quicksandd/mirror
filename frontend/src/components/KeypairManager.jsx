import React, { useState, useEffect } from 'react';
import { getAllStoredUids, clearAllKeypairs, removeKeypairFromStorage } from '../utils/storage.js';

export default function KeypairManager({ isOpen, onClose }) {
  const [storedUids, setStoredUids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStoredUids();
    }
  }, [isOpen]);

  const loadStoredUids = () => {
    const uids = getAllStoredUids();
    setStoredUids(uids);
  };

  const handleClearAll = async () => {
    if (window.confirm('Вы уверены, что хотите удалить все сохраненные ключи? Это действие нельзя отменить.')) {
      setLoading(true);
      try {
        clearAllKeypairs();
        setStoredUids([]);
        console.log('All keypairs cleared');
      } catch (error) {
        console.error('Error clearing keypairs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveKeypair = (uid) => {
    if (window.confirm(`Удалить сохраненный ключ для анализа ${uid}?`)) {
      try {
        removeKeypairFromStorage(uid);
        setStoredUids(prev => prev.filter(id => id !== uid));
        console.log(`Keypair removed for uid: ${uid}`);
      } catch (error) {
        console.error('Error removing keypair:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <dialog open style={{
        padding: 0,
        border: "none", 
        borderRadius: 20,
        maxWidth: 600,
        width: "92vw",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        backgroundColor: "white",
        boxShadow: "0 18px 60px rgba(0,0,0,0.12)"
      }}>
        <div style={{padding: "24px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <h3 style={{margin: 0, fontSize: 20, fontWeight: 600}}>
              Управление сохраненными ключами
            </h3>
            <button 
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                padding: 0,
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>
          </div>

          <p style={{margin: "0 0 20px", color: "#666", fontSize: 14}}>
            Здесь отображаются все сохраненные ключи для автоматической расшифровки анализов.
          </p>

          {storedUids.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
              fontSize: 14
            }}>
              Нет сохраненных ключей
            </div>
          ) : (
            <>
              <div style={{marginBottom: "20px"}}>
                <h4 style={{margin: "0 0 10px", fontSize: 16, fontWeight: 600}}>
                  Сохраненные анализы ({storedUids.length})
                </h4>
                <div style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "10px"
                }}>
                  {storedUids.map(uid => (
                    <div key={uid} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #f3f4f6"
                    }}>
                      <span style={{fontSize: 14, fontFamily: "monospace"}}>
                        {uid}
                      </span>
                      <button
                        onClick={() => handleRemoveKeypair(uid)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 8px",
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end"
              }}>
                <button
                  onClick={handleClearAll}
                  disabled={loading}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? "Удаление..." : "Удалить все"}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Закрыть
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
