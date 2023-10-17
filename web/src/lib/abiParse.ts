export function parseAbiToFunction(abi: string) {
    try {
        const parsedAbi = JSON.parse(abi);
        const functionAbi = parsedAbi.filter(
            (abi: any) =>
                abi.type === "function" &&
                abi.stateMutability !== "view" &&
                abi.stateMutability !== "pure"
        );
        const filteredAbi = functionAbi.map((abi: any) => {
            return {
                name: abi.name,
                inputs:
                    abi.inputs?.map((input: any) => ({
                        name: input.name,
                        type: input.type,
                    })) || [],
                stateMutability: abi.stateMutability,
            };
        });
        return {
            functionAbi, filteredAbi
        }
    } catch (e) {
        throw new Error("Invalid ABI");
    }
}