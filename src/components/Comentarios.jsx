import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CornerUpLeft, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export default function Comentarios({ page }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyUsername, setReplyUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('warning');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [page]);

  async function fetchComments() {
    let { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('page', page)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data);
    }
  }

  async function addComment() {
    if (!content.trim()) {
      setModalMessage('El comentario no puede estar vacío');
      setModalType('warning');
      setShowModal(true);
      return;
    }

    const { error } = await supabase.from('comments').insert([
      {
        content,
        username: username || 'Anónimo',
        parent_id: null,
        page,
      },
    ]);

    if (error) {
      setModalMessage('Error al enviar el comentario');
      setModalType('error');
      setShowModal(true);
      console.error(error);
    } else {
      setContent('');
      setUsername('');
      fetchComments();
    }
  }

  async function addReply() {
    if (!replyContent.trim()) {
      setModalMessage('La respuesta no puede estar vacía');
      setModalType('warning');
      setShowModal(true);
      return;
    }

    const { error } = await supabase.from('comments').insert([
      {
        content: replyContent,
        username: replyUsername || 'Anónimo',
        parent_id: replyTo,
        page,
      },
    ]);

    if (error) {
      setModalMessage('Error al enviar la respuesta');
      setModalType('error');
      setShowModal(true);
      console.error(error);
    } else {
      setReplyContent('');
      setReplyUsername('');
      setReplyTo(null);
      fetchComments();
    }
  }

  function renderComments(parentId = null) {
    const filtered = comments.filter((c) => c.parent_id === parentId);
    const sortedComments = [...filtered].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return sortedComments.map((comment) => {
      const isRoot = parentId === null;

      return (
        <div key={comment.id} className={`relative ${isRoot ? 'mb-6' : 'mb-6'}`}>
          <div
            className={`relative rounded-lg shadow-md p-4 bg-white border border-gray-200 ${
              isRoot ? 'max-w-3xl mx-auto' : 'ml-6 md:ml-14 max-w-3xl'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-800 text-base">
                {comment.username}
              </span>
              <small className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </small>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
              {comment.content}
            </p>

            {isRoot && (
              <button
                onClick={() => {
                  setReplyTo(comment.id);
                  setReplyContent('');
                  setReplyUsername('');
                }}
                className="mt-2 flex items-center gap-1 text-green-700 hover:underline text-sm font-medium"
              >
                <CornerUpLeft size={16} /> Responder
              </button>
            )}
          </div>

          {!isRoot && (
            <div className="absolute h-full left-3 md:left-8 top-0 border-l-2 border-green-900"></div>
          )}

          {replyTo === comment.id && (
            <div className="mt-4 w-full">
              <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-[100%] border border-gray-200">
                <div className="flex flex-row justify-between gap-4 items-start">
                  {/* Inputs a la izquierda */}
                  <div className="flex flex-col w-full">
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      className="p-2 mb-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-700"
                      value={replyUsername}
                      onChange={(e) => setReplyUsername(e.target.value)}
                    />
                    <textarea
                      rows="1"
                      placeholder="Escribe tu respuesta..."
                      className="p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                  </div>

                  {/* Botones a la derecha, uno encima del otro */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={addReply}
                      className="bg-[#047e58] text-white text-sm px-4 py-2 rounded hover:bg-[#065f46] transition-all hover:scale-105"
                    >
                      Enviar
                    </button>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="bg-[#dc2626] text-white px-4 py-2 text-sm rounded hover:bg-[#7f1d1d] transition-all hover:scale-105"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="mt-5 sm:ml-12 md:ml-8 lg:ml-2">{renderComments(comment.id)}</div>
        </div>
      );
    });
  }

  function Modal({ type = 'warning', message, onClose }) {
    const icons = {
      warning: <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2 mx-auto" />,
      error: <XCircle className="w-12 h-12 text-red-500 mb-2 mx-auto" />,
      success: <CheckCircle className="w-12 h-12 text-green-500 mb-2 mx-auto" />,
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Fondo oscuro con opacidad */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Contenido del modal (sin opacidad) */}
        <div className="relative z-10 bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          {icons[type]}
          <p className="text-gray-800 mb-4 text-base">{message}</p>
          <button
            onClick={onClose}
            className="bg-[#dc2626] text-white px-4 py-2 rounded hover:bg-[#7f1d1d] transition-all hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen w-full px-4 py-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-8 rounded-lg bg-white p-4 shadow-md border border-gray-200">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col w-full">
              <input
                type="text"
                placeholder="Tu nombre (opcional)"
                className="p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <textarea
                rows="1"
                placeholder="Añadir un comentario"
                className="p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="">
              <button
                onClick={addComment}
                className="bg-[#047e58] text-white px-6 py-2 rounded hover:bg-[#065f46] hover:scale-105 transition"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        <div>{renderComments()}</div>
        <div ref={bottomRef}></div>

        {showModal && (
          <Modal
            type={modalType}
            message={modalMessage}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}
