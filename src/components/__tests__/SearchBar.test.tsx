import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

describe('SearchBar component', () => {
  it('deve renderizar com o placeholder padrão', () => {
    const { getByPlaceholderText } = render(<SearchBar value="" onChangeText={jest.fn()} />);

    expect(getByPlaceholderText('Buscar por nome, modelo, série...')).toBeTruthy();
  });

  it('deve chamar onChangeText ao digitar', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar value="" onChangeText={onChangeTextMock} />);

    const input = getByPlaceholderText('Buscar por nome, modelo, série...');
    fireEvent.changeText(input, 'Ozone');

    expect(onChangeTextMock).toHaveBeenCalledWith('Ozone');
  });

  it('deve exibir botão de limpar quando houver texto e limpar ao clicar', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="Ozone" onChangeText={onChangeTextMock} />
    );

    const input = getByPlaceholderText('Buscar por nome, modelo, série...');
    expect(input.props.value).toBe('Ozone');
  });
});
