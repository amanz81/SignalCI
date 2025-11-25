import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Send } from 'lucide-react';

const ActionNode = ({ data }: { data: { actionType?: string } }) => {
    const actionType = data.actionType || 'Telegram';

    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex justify-center items-center bg-stone-100">
                    <Send className="w-4 h-4" />
                </div>
                <div className="ml-2">
                    <div className="text-lg font-bold">Action</div>
                    <div className="text-gray-500 text-xs">Send {actionType}</div>
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="w-16 !bg-stone-500" />
        </div>
    );
};

export default memo(ActionNode);
