import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { Employee } from '../../types';
import Card from '../ui/Card';

interface OrgNodeProps {
    employee: Employee;
    children?: React.ReactNode;
}

const OrgNode: React.FC<OrgNodeProps> = ({ employee, children }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[200px] text-center">
                <img src={employee.avatarUrl} alt={employee.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white">{employee.name}</h4>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-normal">{employee.jobTitle}</p>
            </div>
            {children && (
                <>
                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />
                    <div className="flex justify-center">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

interface TreeNode {
    employee: Employee;
    children: TreeNode[];
}

const OrganizationChart: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.getEmployees()
            .then(data => setEmployees(data))
            .catch(err => {
                console.error(err);
                setError("Failed to load employee data.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const orgTree = useMemo(() => {
        if (employees.length === 0) return null;

        // Fix: Explicitly type the Map and its values to prevent incorrect type inference,
        // which caused node properties to be inaccessible.
        const employeeMap: Map<string, TreeNode> = new Map(
            employees.map(e => [e.id, { employee: e, children: [] }])
        );
        const roots: TreeNode[] = [];

        // Iterate over the map to build the tree structure
        employeeMap.forEach((node) => {
            const employee = node.employee;
            if (employee.managerId) {
                const managerNode = employeeMap.get(employee.managerId);
                if (managerNode) {
                    managerNode.children.push(node);
                } else {
                    // If managerId exists but manager is not in map, treat as a root.
                    roots.push(node);
                }
            } else {
                // No managerId, it's a root.
                roots.push(node);
            }
        });


        return roots;
    }, [employees]);

    const renderTree = (nodes: TreeNode[]) => {
        return (
            <div className="flex gap-12 justify-center">
                {nodes.map(node => (
                    <div key={node.employee.id} className="flex flex-col items-center">
                         <OrgNode employee={node.employee}>
                            {node.children.length > 0 && renderTree(node.children)}
                        </OrgNode>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return <Card><p className="text-center text-slate-500">Loading organization chart...</p></Card>;
    }

    if (error) {
        return <Card><p className="text-center text-red-500">{error}</p></Card>;
    }

    return (
        <Card>
            <h3 className="text-2xl font-semibold mb-10 text-center text-slate-900 dark:text-white">Company Organization Chart</h3>
            <div className="overflow-x-auto p-4">
                {orgTree && renderTree(orgTree)}
            </div>
        </Card>
    );
};

export default OrganizationChart;