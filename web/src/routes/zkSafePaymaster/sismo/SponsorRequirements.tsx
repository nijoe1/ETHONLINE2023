import { Button } from "@mui/material";
import { Badge } from "../../../logic/services";
import axios, { CancelTokenSource } from "axios";
import { useCallback, useEffect } from "react";

import SismoGroup from "./SismoGroup";
import SismoSearch from "./SismoSearch";

export default function UserRequirements({
  nextStep,
  addGroup,
  groups,
  removeGroup,
}: {
  nextStep: any;
  addGroup: (id: string) => void;
  groups: any;
  removeGroup: (id: string) => void;
}) {
  let cancelToken: CancelTokenSource;

  const loadOptions = useCallback(async (inputValue: string) => {
    // Prepare the GraphQL query and variables
    const query = `
    query ExampleQuery($first: Int, $where: Group_filter) {
      groups(first: $first, where: $where) {
        id
        generationFrequency
        description
        name
        snapshots {
          size
          dataUrl
          timestamp
        }
        latestSnapshot {
          dataUrl
          id
          size
          timestamp
          valueDistribution {
            value
            numberOfAccounts
          }
        }
      }
    }
    
    `;

    const variables = {
      first: 10,
      where: {
        name_contains: inputValue,
      },
    };

    // Cancel the previous request
    if (cancelToken) {
      cancelToken.cancel();
    }

    // Create a new CancelToken
    cancelToken = axios.CancelToken.source();

    try {
      const response = await axios({
        url: "https://api.sismo.io/",
        method: "post",
        data: {
          query: query,
          variables: variables,
        },
        cancelToken: cancelToken.token,
      });

      const groups = response.data.data.groups;
      const badges: Badge[] = groups.map((group: any) => ({
        value: group,
        label: group.name,
      }));

      return badges;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cancelToken) {
        cancelToken.cancel();
      }
    };
  }, []);

  useEffect(() => {}, [groups]);

  const handleSelect = useCallback(
    (selected: any) => {
      //change the value to a claimREquest
      addGroup({
        ...selected.value,
        claimType: 0,
        value: 1,
        isOptional: false,
        isSelectableByUser: true,
        extraData: "0x",
      });
    },
    [addGroup]
  );

  return (
    <div className="p-4 rounded-md flex flex-col gap-4 w-[600px] text-black">
      <SismoSearch loadOptions={loadOptions} onSelect={handleSelect} />

      <div className="grid grid-cols-2 sm:grid-cols-1  gap-4 mt-8">
        {groups &&
          groups.map((group: any) => (
            <SismoGroup
              key={group.id}
              group={group}
              removeGroup={removeGroup}
            />
          ))}
      </div>
    </div>
  );
}
