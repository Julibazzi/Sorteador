import { forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { Checkbox, ModalBody, ModalFooter, Stack } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { patents } from '~/assets/patents';
import { AddSolidButton } from '~/components/Button/AddSolidButton';
import { CancelSolidButton } from '~/components/Button/CancelSolidButton';
import { SaveSolidButton } from '~/components/Button/SaveSolidButton';
import { Input } from '~/components/Form/Input';
import { Modal, ModalHandle } from '~/components/Form/Modal';
import { Select } from '~/components/Form/Select';
import { TABLE_PLAYERS } from '~/config/constants';
import { useFeedback } from '~/contexts/FeedbackContext';
import IPlayer from '~/models/Entity/IPlayer';
import IRecordModal from '~/models/IRecordModal';
import { getPlayer } from '~/services/hooks/usePlayers';
import { queryClient } from '~/services/queryClient';
import supabase from '~/services/supabase';

export type PlayerModalHandle = {
  onOpenModal: (recordModal?: IRecordModal) => void;
};

const PlayerModalBase: ForwardRefRenderFunction<PlayerModalHandle> = (any, ref) => {
  const modalRef = useRef<ModalHandle>(null);

  const { errorFeedbackToast, successFeedbackToast } = useFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [recordModalProps, setRecordModalProps] = useState<IRecordModal | undefined>({} as IRecordModal);

  const playerSchema = yup.object().shape({
    name: yup.string().min(3).required(),
    username: yup.string().min(3).required(),
    active: yup.boolean().required(),
    patent: yup
      .object()
      .shape({
        id: yup.string().required(),
        name: yup.string(),
      })
      .nullable()
      .required(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Partial<IPlayer>>({
    resolver: yupResolver(playerSchema),
  });

  const onOpenModal = useCallback(
    (recordModal?: IRecordModal) => {
      setRecordModalProps(recordModal);
      if (recordModal?.id) {
        setIsLoading(true);
        getPlayer(recordModal?.id, recordModal?.userId)
          .then((response) => {
            reset({
              ...response,
              patent: patents.find((patent) => patent.id === response.patent),
            });
          })
          .catch((error) => {
            errorFeedbackToast('Jogador', error);
            modalRef.current?.onCloseModal();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        reset({});
      }
      modalRef.current?.onOpenModal();
    },
    [errorFeedbackToast, reset]
  );

  const createOrUpdatePlayer = useMutation(
    async (player: Partial<IPlayer>) => {
      const { id, name, username, patent, active } = player;

      await supabase.from(TABLE_PLAYERS).upsert({
        id,
        user_id: recordModalProps?.userId,
        name,
        username,
        patent: patent?.id,
        active,
      });
    },
    {
      onSuccess() {
        successFeedbackToast('Jogador', `${recordModalProps?.id ? 'Atualizado' : 'Cadastrada'} com sucesso!`);
        queryClient.invalidateQueries(TABLE_PLAYERS);
        modalRef.current?.onCloseModal();
      },
      onError(error) {
        errorFeedbackToast('Jogador', error);
      },
    }
  );

  const handleOk: SubmitHandler<Partial<IPlayer>> = async (data) => {
    await createOrUpdatePlayer.mutateAsync(data);
  };

  useImperativeHandle(
    ref,
    () => ({
      onOpenModal,
    }),
    [onOpenModal]
  );

  return (
    <Modal title="Jogador" ref={modalRef} size="3xl" onSubmit={handleSubmit(handleOk)}>
      <ModalBody>
        <Stack>
          <Input
            label="Nome"
            error={errors.name}
            {...register('name')}
            isLoading={isLoading}
            isDisabled={isSubmitting}
            isRequired
          />
          <Input
            label="Usuário da Steam"
            error={errors.username}
            {...register('username')}
            isLoading={isLoading}
            isDisabled={isSubmitting}
            isRequired
          />
          <Select
            label="Patente"
            options={patents}
            value={watch('patent')}
            error={errors.patent?.id}
            {...register('patent')}
            isLoading={isLoading}
            isDisabled={isSubmitting}
            isRequired
            onChange={(option) => {
              setValue('patent', option);
            }}
          />
          <Checkbox {...register('active')}>Ativo</Checkbox>
        </Stack>
      </ModalBody>
      <ModalFooter flexDirection={['column', 'row']} justifyContent="space-between">
        <CancelSolidButton onClick={() => modalRef.current?.onCloseModal()} isDisabled={isSubmitting} />
        {recordModalProps?.id ? (
          <SaveSolidButton type="submit" isLoading={isSubmitting} />
        ) : (
          <AddSolidButton type="submit" isLoading={isSubmitting} />
        )}
      </ModalFooter>
    </Modal>
  );
};

export const PlayerModal = forwardRef(PlayerModalBase);