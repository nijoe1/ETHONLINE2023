// groupCard.tsx
import { Card, CardContent,  CardHeader, } from '@mui/material';
import { UsersIcon } from '@heroicons/react/24/outline';
import React from 'react';
interface SismoGroupProps {
  group: any;
  removeGroup: any;

}

// claimType: ClaimType.GTE,
/* groupId: undefined,
groupTimestamp: "0x6c617465737400000000000000000000",
value: 1,
isOptional: false,
isSelectableByUser: true,
extraData: "0x" */


const SismoGroup: React.FC<SismoGroupProps> = ({ group, removeGroup }) => {
    console.log("group item")
    console.log(group)
    
    //check if the status or the settinsg for  sismo standards
  return (
    
    <Card 
        className={`col-span-1 border rounded-lg  bg-white relative group cursor-pointer `}
    >
      <CardHeader className="text-left">
        <strong>{group.name}</strong>
        <strong >{group.id}</strong>
      </CardHeader> 
      <CardContent className='grid grid-cols-4 gap-4'>
        <span>
            claimType: {group.claimType}
        </span>
        <span>
            groupTimestamp: {group.groupTimestamp}
        </span>
        <span className="text-gray-600 text-sm flex justify-center items-center gap-4 bottom-0 relative">
          <UsersIcon height="16" width="16"/> {group.latestSnapshot.valueDistribution[0].numberOfAccounts}
        </span>
        <span className="text-red-600 text-sm flex justify-center items-center gap-4 bottom-0 relative" onClick={() => removeGroup(group.id)}>
          remove 
          </span>
      </CardContent>

    </Card>
  );
};

export default SismoGroup;