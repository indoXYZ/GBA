import { Button } from '@mui/material';
import { useCallback, useContext, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { BiCloudUpload } from 'react-icons/bi';
import { styled } from 'styled-components';

import { ModalBody } from './modal-body.tsx';
import { ModalFooter } from './modal-footer.tsx';
import { ModalHeader } from './modal-header.tsx';
import { EmulatorContext } from '../../context/emulator/emulator.tsx';
import { ModalContext } from '../../context/modal/modal.tsx';

type InputProps = {
  cheatFiles: File[];
};

type FormProps = {
  $isDragActive?: boolean;
};

const StyledForm = styled.form<FormProps>`
  cursor: pointer;
  border-color: ${({ theme }) => theme.blackRussian};
  background-color: ${({ $isDragActive = false, theme }) =>
    $isDragActive ? theme.arcticAirBlue : theme.aliceBlue2};
  border-width: 1px;
  border-style: dashed;
  padding: 0.5rem;
  text-align: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

const BiCloudUploadLarge = styled(BiCloudUpload)`
  height: 60px;
  width: auto;
`;

const CenteredTextContainer = styled.div`
  text-align: center;
`;

export const UploadCheatsModal = () => {
  const { setIsModalOpen } = useContext(ModalContext);
  const { emulator } = useContext(EmulatorContext);
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm<InputProps>();
  const [hasCompletedUpload, setHasCompletedUpload] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setValue('cheatFiles', acceptedFiles, { shouldValidate: true });
      setHasCompletedUpload(false);
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const onSubmit: SubmitHandler<InputProps> = ({ cheatFiles }) => {
    cheatFiles.forEach((cheatFiles) => emulator?.uploadCheats(cheatFiles));
    reset();
    setHasCompletedUpload(true);
  };

  const triggerFileInputOnClick = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.click();
  };

  const files = watch('cheatFiles');

  const validateFileNames = (cheatFiles: File[]) => {
    return cheatFiles.every(
      (cheatFile: File) => cheatFile.name.split('.').pop() === 'cheats'
    );
  };

  return (
    <>
      <ModalHeader title="Upload Cheats" />
      <ModalBody>
        <StyledForm
          {...getRootProps({
            id: 'uploadCheatsForm',
            onSubmit: handleSubmit(onSubmit),
            $isDragActive: isDragActive,
            onClick: triggerFileInputOnClick
          })}
        >
          <HiddenInput
            {...getInputProps({
              ...register('cheatFiles', {
                validate: (cheatsList) =>
                  (cheatsList?.length > 0 && validateFileNames(cheatsList)) ||
                  'At least one .cheats file is required'
              }),
              ref: hiddenInputRef
            })}
          />
          <BiCloudUploadLarge />
          <p>
            Drag and drop a cheats file here,
            <br /> or click to upload a file
          </p>
          {errors.cheatFiles && (
            <p>
              Cheats file submit has failed: <br /> -{' '}
              {errors.cheatFiles.message}
            </p>
          )}
        </StyledForm>
        <div>
          {!!files?.length && (
            <CenteredTextContainer>
              <p>Files to upload:</p>
              {files.map((file) => {
                return (
                  <div key={file.name}>
                    <p>{file.name}</p>
                  </div>
                );
              })}
            </CenteredTextContainer>
          )}
          {hasCompletedUpload && (
            <CenteredTextContainer>
              <p>Upload complete!</p>
            </CenteredTextContainer>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button form="uploadCheatsForm" type="submit" variant="contained">
          Upload
        </Button>
        <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
          Close
        </Button>
      </ModalFooter>
    </>
  );
};
