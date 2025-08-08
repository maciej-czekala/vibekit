// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { ChevronDown, ChevronRight, Check, AlertTriangle, Play, Terminal } from "lucide-react";
// import { useEnvironmentConfigs } from "@/hooks/use-config";
// import { ENVIRONMENT_CONFIG, EnvironmentId } from "@/lib/config-storage";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { testDaggerSetup } from "@/app/actions/dagger";

// interface DaggerSetupSectionProps {
//   onExpand?: () => void;
// }

// export function DaggerSetupSection({ onExpand }: DaggerSetupSectionProps) {
//   const { mounted, saveEnvironmentConfig, getEnvironmentConfigInfo } = useEnvironmentConfigs();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isTesting, setIsTesting] = useState(false);
//   const [testResults, setTestResults] = useState<{
//     docker: boolean;
//     dagger: boolean;
//     errors: string[];
//   } | null>(null);
//   const [inputValues, setInputValues] = useState<Record<string, string>>({});

//   const daggerConfigs: EnvironmentId[] = ['dagger_docker_hub_user', 'dagger_private_registry'];

//   const handleTestDagger = async () => {
//     setIsTesting(true);
//     setTestResults(null);

//     try {
//       const result = await testDaggerSetup();
      
//       setTestResults({
//         docker: result.docker,
//         dagger: result.dagger,
//         errors: result.errors,
//       });
//     } catch {
//       setTestResults({
//         docker: false,
//         dagger: false,
//         errors: ['Failed to test dagger setup'],
//       });
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   const handleSaveConfig = (configId: EnvironmentId, value: string) => {
//     const success = saveEnvironmentConfig(configId, value);
//     if (success) {
//       // Show success feedback
//       if (typeof window !== 'undefined') {
//         window.dispatchEvent(new CustomEvent('vibekit-config-changed'));
//       }
//     }
//   };

//   const handleInputChange = (configId: string, value: string) => {
//     setInputValues(prev => ({
//       ...prev,
//       [configId]: value
//     }));
//   };

//   const configInfo = mounted ? getEnvironmentConfigInfo() : {};

//   return (
//     <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//       <CollapsibleTrigger asChild>
//         <Button
//           variant="ghost"
//           className="w-full justify-between p-4 h-auto"
//           onClick={() => onExpand?.()}
//         >
//           <div className="flex items-center gap-3">
//             <Terminal className="h-5 w-5" />
//             <div className="text-left">
//               <h3 className="font-semibold">Local Development (Dagger)</h3>
//               <p className="text-sm text-muted-foreground">
//                 Configure local sandbox development with Docker and Dagger
//               </p>
//             </div>
//           </div>
//           {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//         </Button>
//       </CollapsibleTrigger>
      
//       <CollapsibleContent className="space-y-4 p-4 pt-0">
//         <div className="space-y-4">
//           {/* Status Section */}
//           <div className="space-y-2">
//             <h4 className="font-medium">System Status</h4>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleTestDagger}
//                 disabled={isTesting}
//                 className="flex items-center gap-2"
//               >
//                 {isTesting ? (
//                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                 ) : (
//                   <Play className="h-4 w-4" />
//                 )}
//                 Test Dagger Setup
//               </Button>
//             </div>
            
//             {testResults && (
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-sm">
//                   <Check className={`h-4 w-4 ${testResults.docker ? 'text-green-500' : 'text-red-500'}`} />
//                   <span>Docker: {testResults.docker ? 'Available' : 'Not found'}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Check className={`h-4 w-4 ${testResults.dagger ? 'text-green-500' : 'text-red-500'}`} />
//                   <span>Dagger: {testResults.dagger ? 'Available' : 'Not found'}</span>
//                 </div>
//                 {testResults.errors.length > 0 && (
//                   <Alert variant="destructive">
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>
//                       {testResults.errors.join(', ')}
//                     </AlertDescription>
//                   </Alert>
//                 )}
//               </div>
//             )}
//           </div>

//           <Separator />

//           {/* Configuration Section */}
//           <div className="space-y-4">
//             <h4 className="font-medium">Configuration (Optional)</h4>
//             <p className="text-sm text-muted-foreground">
//               Configure optional settings for optimized local development
//             </p>
            
//             {daggerConfigs.map((configId) => {
//               const config = ENVIRONMENT_CONFIG[configId];
//               const currentValue = (configInfo as Record<string, { value: string }>)[configId]?.value || '';
//               const inputValue = inputValues[configId] ?? currentValue;
              
//               return (
//                 <div key={configId} className="space-y-2">
//                   <Label htmlFor={configId}>{config.name}</Label>
//                   <div className="flex gap-2">
//                     <Input
//                       id={configId}
//                       type="text"
//                       placeholder={config.description}
//                       value={inputValue}
//                       onChange={(e) => handleInputChange(configId, e.target.value)}
//                       className="flex-1"
//                     />
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleSaveConfig(configId, inputValue)}
//                       disabled={inputValue === currentValue}
//                     >
//                       Save
//                     </Button>
//                   </div>
//                   <p className="text-xs text-muted-foreground">{config.description}</p>
//                 </div>
//               );
//             })}
//           </div>

//           <Separator />

//           {/* Instructions Section */}
//           <div className="space-y-2">
//             <h4 className="font-medium">Setup Instructions</h4>
//             <div className="text-sm text-muted-foreground space-y-2">
//               <p>To use local development with Dagger:</p>
//               <ol className="list-decimal list-inside space-y-1 ml-4">
//                 <li>Install Docker Desktop or Docker Engine</li>
//                 <li>Install Dagger CLI: <code className="bg-muted px-1 rounded">curl -fsSL https://dagger.io/install.sh | bash</code></li>
//                 <li>Test the setup using the button above</li>
//                 <li>Optional: Configure Docker Hub username for optimized images</li>
//               </ol>
//             </div>
//           </div>
//         </div>
//       </CollapsibleContent>
//     </Collapsible>
//   );
// }
