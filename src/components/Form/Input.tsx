import { forwardRef, ForwardRefRenderFunction, ReactNode } from 'react';
import { FieldError } from 'react-hook-form';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input as ChakraInput,
  InputGroup,
  InputProps as ChakraInputProps,
  Skeleton,
} from '@chakra-ui/react';

interface InputProps extends ChakraInputProps {
  name: string;
  label?: string;
  error?: FieldError;
  isRequired?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { name, label, error, isRequired, isLoading, maxW, children, ...rest }: InputProps,
  ref
) => {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired} maxW={maxW}>
      {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      {isLoading && <Skeleton height="10" borderRadius={4} />}
      {!isLoading && (
        <InputGroup>
          <ChakraInput ref={ref} id={name} name={name} autoComplete="off" {...rest} />
          {children}
        </InputGroup>
      )}
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};

export const Input = forwardRef(InputBase);
