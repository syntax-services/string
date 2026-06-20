import os

path = r'C:\Users\Administrator\Documents\string\src\pages\business\BusinessMessages.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });', 'const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });')
content = content.replace('<div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] flex flex-col">', '<div className="h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-8rem)] flex flex-col">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated BusinessMessages.tsx')
