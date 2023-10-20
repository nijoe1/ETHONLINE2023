// groupCard.tsx
import { Card, CardContent, CardHeader } from "@mui/material";
import { UsersIcon } from "@heroicons/react/24/outline";
import { BsFillTrash3Fill } from "react-icons/bs";
import React from "react";
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
  //check if the status or the settinsg for  sismo standards
  return (
    <Card className="col-span-1">
      <CardContent className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap  items-center">
          <table className="flex flex-col items-center bg-gray-200">
            <tr className="flex flex-col items-center">
              <td>{`${group.name}`}</td>
              <td>
                <UsersIcon height="16" width="16" />
                {`${
                  group?.latestSnapshot?.valueDistribution[0]
                    ?.numberOfAccounts || 0
                }`}
              </td>
              <td>
                <span
                  className="text-red-600 text-sm cursor-pointer"
                  onClick={() => removeGroup(group.id)}
                >
                  <BsFillTrash3Fill
                    className="text-red-600 text-sm cursor-pointer"
                    size={16}
                    style={{ marginLeft: "4px" }}
                    onClick={() => removeGroup(group.id)}
                  />
                </span>
              </td>
            </tr>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SismoGroup;
