import { useEffect, useState } from 'react';
import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import Confirmation from '../confirmation/Confirmation';

interface Option {
  id: number;
  optionText: string;
}
interface DropDownOptionsProps {
  options: Option[];
  setSelectedOption: (option: Option) => void;
  text:string;
  setUserChangedVote?: ((vote: boolean) => void) | null;
}

export default function DropDownOptions({ options, setSelectedOption, text, setUserChangedVote }:DropDownOptionsProps) {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationOption, setConfirmationOption] = useState<string>("");
  const [tempVote, setTempVote] = useState<Option>({id:-1, optionText: "N/A"});
  
  useEffect(() => {
    if (confirmationOption === "confirm") {
        setSelectedOption(tempVote);
        if (setUserChangedVote) setUserChangedVote(true);
    }
  }, [confirmationOption])

  function handleClick(option: Option) {
    if (text === "Vote") {
      setTempVote(option);
      setShowConfirmation(true);
    }
    else{
      setSelectedOption(option);
      if (setUserChangedVote) setUserChangedVote(true);
    }
  }
  return (
    <>
      <Dropdown>
        <MenuButton>{text}</MenuButton>
        <Menu slots={{ listbox: Listbox }}>
          {options.map((item: Option, index: number) => (
            <MenuItem key={index} onClick={() => handleClick(item)} >{item.optionText}</MenuItem>
          ))}
        </Menu>
      </Dropdown>
      {showConfirmation && <Confirmation showConfirmation={showConfirmation} setShowConfirmation={setShowConfirmation} setConfirmationOption={setConfirmationOption} question={`Are you sure you want to vote for "${tempVote.optionText}"?`}/>}
    </>
  );
}

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0 4px 6px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
  };
  z-index: 1;
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);


  &:active {
    background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);