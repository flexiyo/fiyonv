import {createContext, useState} from 'react';

const CreateContext = createContext(null);

export const CreateProvider = ({children}) => {
  const [selectedFileType, setSelectedFileType] = useState('image');
  const [selectedFilePath, setSelectedFilePath] = useState(
    'https://via.placeholder.com/400x400',
  );
  const [selectedFileThumbnail, setSelectedFileThumbnail] = useState('');
  return (
    <CreateContext.Provider
      value={{
        selectedFileType,
        setSelectedFileType,
        selectedFilePath,
        setSelectedFilePath,
        selectedFileThumbnail,
        setSelectedFileThumbnail,
      }}>
      {children}
    </CreateContext.Provider>
  );
};

export default CreateContext;
