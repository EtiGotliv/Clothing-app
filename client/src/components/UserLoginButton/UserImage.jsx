import React, { useState, useEffect } from 'react';
import md5 from 'md5';

const fallbackColors = ["#fce8e6", "#ffe5f0", "#f3d9ca", "#fff1e0"];

const getGravatarUrl = (email) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=404`;
};

const getInitials = (name) => {
  return (name?.[0] || "?").toUpperCase();
};

const getRandomColor = (seed) => {
  const index = seed.charCodeAt(0) % fallbackColors.length;
  return fallbackColors[index];
};

const UserImage = ({ email, name, size = 48, style = {} }) => {
  const [src, setSrc] = useState(null);
  const [gravatarFailed, setGravatarFailed] = useState(false);

  useEffect(() => {
    if (!email) return;
    const gravatarUrl = getGravatarUrl(email);

    fetch(gravatarUrl)
      .then((res) => {
        if (res.ok) setSrc(gravatarUrl);
        else setGravatarFailed(true);
      })
      .catch(() => setGravatarFailed(true));
  }, [email]);

  if (src) {
    return <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', ...style }} />;
  }

  const initials = getInitials(name);
  const bgColor = getRandomColor(initials);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#4b2e2e',
        fontWeight: 'bold',
        fontSize: size / 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default UserImage;
