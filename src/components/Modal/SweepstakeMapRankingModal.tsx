import {
  forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle, useRef, useState,
} from 'react';
import { GiUnlitBomb } from 'react-icons/gi';
import { MdEmojiPeople } from 'react-icons/md';
import { RiUploadCloudLine } from 'react-icons/ri';

import {
  Icon,
  IconButton,
  ModalBody, ModalFooter, Stack,
  TableContainer,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ColumnDef } from '@tanstack/react-table';

import { PremierBadge } from '~/components/Badge/PremierBadge';
import Card from '~/components/Card';
import CardBody from '~/components/Card/CardBody';
import CardHeader from '~/components/Card/CardHeader';
import { Modal, ModalHandle } from '~/components/Form/Modal';
import { Table } from '~/components/Form/Table';
import { ImportImageLeaderboardModal, ImportImageLeaderboardModalHandle } from '~/components/Modal/ImportImageLeaderboardModal';
import { useFeedback } from '~/contexts/FeedbackContext';
import IRankingAPI from '~/models/Entity/Ranking/IRankingAPI';
import ISweepstakeMapModal from '~/models/Modal/ISweepstakeMapModal';
import { getSweepstakeMapRanking } from '~/services/hooks/useSweepstakeMapRanking';

export type SweepstakeMapRankingModalHandle = {
  onOpenModal: (recordModal: ISweepstakeMapModal) => void;
};

const SweepstakeMapRankingModalBase: ForwardRefRenderFunction<SweepstakeMapRankingModalHandle> = (any, ref) => {
  const modalRef = useRef<ModalHandle>(null);
  const importImageLeaderboardModalRef = useRef<ImportImageLeaderboardModalHandle>(null);

  const { warningFeedbackToast, errorFeedbackToast } = useFeedback();
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recordModalProps, setRecordModalProps] = useState<ISweepstakeMapModal | undefined>();
  const [rankings, setRankings] = useState<IRankingAPI[]>([]);

  const rankingColumns: ColumnDef<IRankingAPI>[] = [
    {
      accessorKey: 'format_player_name',
      header: 'Nome',
      enableSorting: false,
    },
    {
      accessorKey: 'format_player_username',
      header: 'Steam',
      enableSorting: false,
    },
    {
      accessorKey: 'premier',
      header: 'Premier',
      enableSorting: false,
      // eslint-disable-next-line react/no-unstable-nested-components
      cell: ({ row }) => <PremierBadge premier={row.original.players?.premier} />,
    },
    {
      accessorKey: 'kills',
      header: 'Vítimas',
      enableSorting: false,
    },
    {
      accessorKey: 'deaths',
      header: 'Mortes',
      enableSorting: false,
    },
    {
      accessorKey: 'assistances',
      header: 'Assist.',
      enableSorting: false,
    },
    {
      accessorKey: 'headshot_percentage',
      header: '%TC',
      enableSorting: false,
    },
    {
      accessorKey: 'damage',
      header: 'Dano',
      enableSorting: false,
    },
  ];

  const onOpenModal = useCallback(
    (recordModal: ISweepstakeMapModal) => {
      setRecordModalProps(recordModal);
      setRankings([]);
      if (recordModal?.sweepstakeMap) {
        setIsLoading(true);
        getSweepstakeMapRanking({
          mapId: recordModal.sweepstakeMap.map_id,
          sweepstakeId: recordModal.sweepstakeMap.sweepstake_id,
        })
          .then((response) => {
            setRankings(response);
          })
          .catch((error) => {
            errorFeedbackToast('Ranking', error);
            modalRef.current?.onCloseModal();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        warningFeedbackToast('Ranking', 'Mapa não informado!');
        modalRef.current?.onCloseModal();
      }
      modalRef.current?.onOpenModal();
    },
    [errorFeedbackToast, warningFeedbackToast],
  );

  function handleImportImageLeaderboards() {
    if (!recordModalProps?.user) {
      return;
    }

    importImageLeaderboardModalRef.current?.onOpenModal({
      id: recordModalProps.sweepstakeMap?.id,
      user: recordModalProps?.user,
      sweepstakeMap: recordModalProps.sweepstakeMap,
    });
  }

  useImperativeHandle(
    ref,
    () => ({
      onOpenModal,
    }),
    [onOpenModal],
  );

  return (
    <>
      <ImportImageLeaderboardModal ref={importImageLeaderboardModalRef} />
      <Modal ref={modalRef} title="Ranking" size="4xl">
        <ModalBody>
          <Stack>
            <Card>
              <CardHeader
                icon={recordModalProps?.sweepstakeMap?.maps?.map_type === 'bomb' ? GiUnlitBomb : MdEmojiPeople}
                title={recordModalProps?.sweepstakeMap?.maps?.name || ''}
                size="sm"
              >
                {!isMobile && recordModalProps?.user && recordModalProps?.user.id === recordModalProps?.sweepstakeMap.user_id && (
                  <IconButton
                    colorScheme="gray"
                    icon={<Icon as={RiUploadCloudLine} fontSize="xl" />}
                    aria-label="Imagem"
                    title="Importar Pontuação"
                    onClick={() => handleImportImageLeaderboards()}
                    size="sm"
                  />
                )}
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table
                    data={rankings}
                    columns={rankingColumns}
                    isLoading={isLoading}
                  />
                </TableContainer>
              </CardBody>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter />
      </Modal>
    </>
  );
};

export const SweepstakeMapRankingModal = forwardRef(SweepstakeMapRankingModalBase);