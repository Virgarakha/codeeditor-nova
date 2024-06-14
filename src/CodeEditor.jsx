import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'html',
  'css',
  'json',
  'markdown',
  'xml',
  'yaml'
];

const CodeEditor = () => {
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('files');
    return savedFiles ? JSON.parse(savedFiles) : [{ name: 'untitled.js', language: 'javascript', code: '' }];
  });
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keybinding for undo (Ctrl+Z)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'undo', null);
    });

    // Add keybinding for redo (Ctrl+Shift+Z)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'redo', null);
    });

    // Add keybinding for find (Ctrl+F)
    editor.addAction({
      id: 'find-action',
      label: 'Find',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      run: (ed) => {
        editor.getAction('actions.find').run();
      }
    });

    // Add keybinding for auto-completion (Ctrl+Space)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', null);
    });
  };

  const handleEditorChange = (value) => {
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex].code = value;
    setFiles(updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        const newFile = {
          name: file.name,
          language: getFileLanguage(file.name),
          code: fileContent
        };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        setActiveFileIndex(updatedFiles.length - 1);
        localStorage.setItem('files', JSON.stringify(updatedFiles));
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('files', JSON.stringify(files));
    alert('Code saved!');
  };

  const handleDownload = () => {
    const activeFile = files[activeFileIndex];
    const fileName = prompt('Enter file name (without extension):', activeFile.name.split('.')[0]);
    const fileExtension = prompt('Enter file extension (e.g., .js, .py):', `.${activeFile.language}`);
    
    if (fileName && fileExtension) {
      const blob = new Blob([activeFile.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('File name and extension are required.');
    }
  };

  const handleAddNewFile = () => {
    const newFile = { name: `untitled${files.length + 1}.js`, language: 'javascript', code: '' };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileIndex(updatedFiles.length - 1);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  };

  const handleTabClick = (index) => {
    setActiveFileIndex(index);
  };

  const handleTabClose = (index) => {
    if (files.length > 1) {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setActiveFileIndex(index === activeFileIndex ? 0 : activeFileIndex - 1);
      localStorage.setItem('files', JSON.stringify(updatedFiles));
    } else {
      alert('Cannot close the last tab.');
    }
  };

  const getFileLanguage = (fileName) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'cs':
        return 'csharp';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'javascript';
    }
  };

  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('files'));
    if (savedFiles) {
      setFiles(savedFiles);
    }

    import('monaco-editor').then((monaco) => {
      if (editorRef.current) {
        // Add keybinding for undo (Ctrl+Z)
        editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
          editorRef.current.trigger('keyboard', 'undo', null);
        });

        // Add keybinding for redo (Ctrl+Shift+Z)
        editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
          editorRef.current.trigger('keyboard', 'redo', null);
        });

        // Add keybinding for find (Ctrl+F)
        editorRef.current.addAction({
          id: 'find-action',
          label: 'Find',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
          run: (ed) => {
            editorRef.current.getAction('actions.find').run();
          }
        });

        // Add keybinding for auto-completion (Ctrl+Space)
        editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
          editorRef.current.trigger('keyboard', 'editor.action.triggerSuggest', null);
        });
      }
    });
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        <select
          value={files[activeFileIndex].language}
          onChange={(e) => {
            const updatedFiles = [...files];
            updatedFiles[activeFileIndex].language = e.target.value;
            setFiles(updatedFiles);
            localStorage.setItem('files', JSON.stringify(updatedFiles));
          }}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".txt,.js,.ts,.py,.java,.cpp,.cs,.html,.css,.json,.md,.xml,.yaml"
          onChange={handleFileUpload}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSave} style={{ padding: '5px 10px', marginRight: '10px' }}>Save</button>
        <button onClick={handleDownload} style={{ padding: '5px 10px', marginRight: '10px' }}>Download</button>
        <button onClick={handleAddNewFile} style={{ padding: '5px 10px' }}>New File</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
        {files.map((file, index) => (
          <div
            key={index}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              borderBottom: activeFileIndex === index ? '2px solid blue' : 'none',
            }}
            onClick={() => handleTabClick(index)}
          >
            {file.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(index);
              }}
              style={{ marginLeft: '5px', color: 'red' }}
            >
              x
            </button>
          </div>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}>
        <MonacoEditor
          height="90vh"
          language={files[activeFileIndex].language}
          value={files[activeFileIndex].code}
          onChange={handleEditorChange}
          editorDidMount={handleEditorDidMount}
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
