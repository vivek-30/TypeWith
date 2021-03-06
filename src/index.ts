import {
  toolBarButton, toolTipps, drawerBtn,
  promptRejected, promptAccepted,
  tools, content, modal, usersList,
  shareInput, dashBoardItem, readOnlyInput
} from './Elements';

import {
  handleSideBarDisplay, handleUsersToolChoice,
  handleContentChange
} from './Executors';

import {
  handlePromptAcceptance, handlePromptRejectance,
  setWork, setParticipants, openSelectedWork, notify
} from './Helpers';

import {
  FloatingActionButton, Tooltip,
  Modal, Sidenav
} from 'materialize-css';

import { socket } from './socket';
import { WorkType, User } from './Definitions';
import './sass/index.scss';

var isSharedMode = shareInput.checked;
var isWritingMode = readOnlyInput.checked;
var isAsked = false;
var activeUsers: User[] = [];
let recentWorks = localStorage.getItem('TypeWithWorks');
let savedWorks: WorkType[] = recentWorks ? JSON.parse(recentWorks) : [];
setWork(savedWorks);

FloatingActionButton.init(toolBarButton, {
  direction: 'left',
  hoverEnabled: false
});

Tooltip.init(toolTipps, {
  position: 'top',
  exitDelay: 0,
  enterDelay: 1,
  inDuration: 300,
  outDuration: 0,
  margin: 10
});

export const modalInstance = Modal.init(modal, {
  dismissible: false,
  opacity: 0.6
});

Sidenav.init(usersList, {
  edge: 'right'
});

// Events For DOM Elements.
content.addEventListener('keyup', (e) => handleContentChange(e, isSharedMode));
shareInput.addEventListener('change', () => isSharedMode = shareInput.checked);
readOnlyInput.addEventListener('change', () => {
  if(!shareInput.checked && readOnlyInput.checked)
    shareInput.checked = true;
  isWritingMode = readOnlyInput.checked
});
dashBoardItem.addEventListener('click', openSelectedWork);
drawerBtn.addEventListener('click', handleSideBarDisplay);
tools.addEventListener('click', handleUsersToolChoice);
promptAccepted.addEventListener('click', handlePromptAcceptance);
promptRejected.addEventListener('click', handlePromptRejectance);

// Socket Events.
socket.emit('get-users-list');

socket.on('writing', (data: string) => {
  if (isWritingMode)
    content.value = data;
  else if (!isAsked) {
    isAsked = true;
    notify('Your Friend Wants To Help You Enable \"Write mode\"');
  }

});

socket.on('update-users-list', (people : User[]) => {
  activeUsers = people;
  setParticipants(people);
});

socket.on('new-user', (person : User) => {
  activeUsers = [ ...activeUsers, person ];
  setParticipants(activeUsers);
});

socket.on('remove-user', ({ id }: User) => {
  activeUsers = activeUsers.filter(({ id: _id }) => _id !== id);
  setParticipants(activeUsers);
});
