export function addressListStub(){
    return [{header: 'Esmeraldo Ybanez',image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/RobertTolbert.jpg',content: 'Software Engineer',},
      {header: 'Ian Steven Colina',image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/WandaHoward.jpg',content: 'UX Designer 2',},
      {header: 'Jhon Carlo Vano',image: 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/TimDeboer.jpg',content: 'Principal Software Engineering Manager',},]
}

export function priorityList(){
     return [{key: '0',label: 'Low',value: 'low',},{key: '1',label: 'Normal',value: 'normal',},{key: '2',label: 'High',value: 'high',}] 
}

export function permissionScope(){
     return ["User.Read", "User.ReadBasic.All", "ChannelMember.Read.All", "ChannelMember.ReadWrite.All"];
}