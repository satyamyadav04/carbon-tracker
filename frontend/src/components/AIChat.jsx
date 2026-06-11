// import { useState } from 'react';
// import api from '../api/axios.js';

// const AIChat = () => {
//   const [message, setMessage] = useState('');
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (!message.trim()) return;

//     const prompt = message.trim();
//     setHistory((prev) => [...prev, { role: 'user', text: prompt }]);
//     setMessage('');
//     setLoading(true);

//     try {
//       const response = await api.post('/assistant/chat', { message: prompt });
//       setHistory((prev) => [...prev, { role: 'assistant', text: response.data.response }]);
//     } catch (error) {
//       setHistory((prev) => [...prev, { role: 'assistant', text: 'Unable to reach AI assistant.' }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="card chat-card">
//       <h2>AI Sustainability Chat</h2>
//       <div className="chat-window">
//         {history.length === 0 ? (
//           <p className="empty-text">Ask the assistant how to lower your carbon footprint.</p>
//         ) : (
//           history.map((messageItem, index) => (
//             <div key={index} className={`chat-message ${messageItem.role}`}>
//               <strong>{messageItem.role === 'user' ? 'You' : 'Assistant'}:</strong>
//               <p>{messageItem.text}</p>
//             </div>
//           ))
//         )}
//       </div>
//       <form className="chat-form" onSubmit={sendMessage}>
//         <input
//           placeholder="Ask the sustainability assistant..."
//           value={message}
//           onChange={(event) => setMessage(event.target.value)}
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? 'Thinking...' : 'Send'}
//         </button>
//       </form>
//     </section>
//   );
// };

// export default AIChat;


import { useState } from 'react';
import api from '../api/axios.js';

// ✅ Text formatter — bold, bullets, numbering
const formatMessage = (text) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return lines.map((line, index) => {
    // Numbered points: 1. 2. 3.
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <li key={index} style={{ marginBottom: '6px' }}>
          {formatInline(content)}
        </li>
      );
    }

    // Bullet points: - or •
    if (/^[-•]\s/.test(line)) {
      const content = line.replace(/^[-•]\s/, '');
      return (
        <li key={index} style={{ marginBottom: '6px', listStyleType: 'disc' }}>
          {formatInline(content)}
        </li>
      );
    }

    // Heading lines ending with :
    if (/:\s*$/.test(line)) {
      return (
        <p key={index} style={{ fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>
          {formatInline(line)}
        </p>
      );
    }

    // Normal line
    return (
      <p key={index} style={{ marginBottom: '6px' }}>
        {formatInline(line)}
      </p>
    );
  });
};

// ✅ Inline bold: **text**
const formatInline = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const prompt = message.trim();
    setHistory((prev) => [...prev, { role: 'user', text: prompt }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/assistant/chat', { message: prompt });
      setHistory((prev) => [...prev, { role: 'assistant', text: response.data.response }]);
    } catch (error) {
      setHistory((prev) => [...prev, { role: 'assistant', text: 'Unable to reach AI assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card chat-card">
      <h2>AI Sustainability Chat</h2>
      <div className="chat-window">
        {history.length === 0 ? (
          <p className="empty-text">Ask the assistant how to lower your carbon footprint.</p>
        ) : (
          history.map((messageItem, index) => (
            <div key={index} className={`chat-message ${messageItem.role}`}>
              <strong>{messageItem.role === 'user' ? 'You' : 'Assistant'}:</strong>

              {messageItem.role === 'assistant' ? (
                <ul style={{ paddingLeft: '18px', margin: '6px 0' }}>
                  {formatMessage(messageItem.text)}
                </ul>
              ) : (
                <p>{messageItem.text}</p>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="chat-message assistant">
            <strong>Assistant:</strong>
            <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Thinking...</p>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          placeholder="Ask the sustainability assistant..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </section>
  );
};

export default AIChat;