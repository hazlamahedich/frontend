'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  ModelProvider, 
  ModelProviderType, 
  ModelHosting, 
  ModelHostingType,
  ModelTierType,
  AVAILABLE_MODELS
} from '@/lib/ai/litellm-config';

interface CustomModel {
  id: string;
  name: string;
  provider: ModelProviderType;
  baseUrl: string;
}

interface ModelSettings {
  preferred_provider: ModelProviderType;
  preferred_hosting: ModelHostingType;
  api_keys: Record<string, string>;
  custom_models: CustomModel[];
}

interface AIModelSettingsProps {
  userId: string;
  userTier: ModelTierType;
  initialSettings: ModelSettings;
}

export default function AIModelSettings({ userId, userTier, initialSettings }: AIModelSettingsProps) {
  const [preferredProvider, setPreferredProvider] = useState<ModelProviderType>(initialSettings.preferred_provider);
  const [preferredHosting, setPreferredHosting] = useState<ModelHostingType>(initialSettings.preferred_hosting);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(initialSettings.api_keys || {});
  const [customModels, setCustomModels] = useState<CustomModel[]>(initialSettings.custom_models || []);
  
  const [newCustomModel, setNewCustomModel] = useState<CustomModel>({
    id: '',
    name: '',
    provider: ModelProvider.CUSTOM,
    baseUrl: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  
  // Get unique API key names from available models
  const apiKeyNames = Array.from(
    new Set(
      AVAILABLE_MODELS
        .filter(model => model.apiKeyName)
        .map(model => model.apiKeyName!)
    )
  );
  
  // Get available providers based on user tier
  const availableProviders = Object.values(ModelProvider).filter(provider => {
    // Free tier users can only use OpenAI, Ollama, and Mistral
    if (userTier === 'free') {
      return [ModelProvider.OPENAI, ModelProvider.OLLAMA, ModelProvider.MISTRAL].includes(provider as ModelProviderType);
    }
    // Standard tier users can use all except custom
    if (userTier === 'standard') {
      return provider !== ModelProvider.CUSTOM;
    }
    // Premium tier users can use all providers
    return true;
  });
  
  // Handle API key change
  const handleApiKeyChange = (keyName: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyName]: value,
    }));
  };
  
  // Handle custom model field change
  const handleCustomModelChange = (field: keyof CustomModel, value: string) => {
    setNewCustomModel(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Add custom model
  const handleAddCustomModel = () => {
    if (!newCustomModel.id || !newCustomModel.name || !newCustomModel.baseUrl) {
      setError('Please fill in all fields for the custom model');
      return;
    }
    
    setCustomModels(prev => [...prev, newCustomModel]);
    setNewCustomModel({
      id: '',
      name: '',
      provider: ModelProvider.CUSTOM,
      baseUrl: '',
    });
  };
  
  // Remove custom model
  const handleRemoveCustomModel = (id: string) => {
    setCustomModels(prev => prev.filter(model => model.id !== id));
  };
  
  // Save settings
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const settings: ModelSettings = {
        preferred_provider: preferredProvider,
        preferred_hosting: preferredHosting,
        api_keys: apiKeys,
        custom_models: customModels,
      };
      
      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('user_model_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingSettings) {
        // Update existing settings
        await supabase
          .from('user_model_settings')
          .update(settings)
          .eq('user_id', userId);
      } else {
        // Insert new settings
        await supabase
          .from('user_model_settings')
          .insert({
            user_id: userId,
            ...settings,
          });
      }
      
      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error('Error saving AI model settings:', err);
      setError('An error occurred while saving your settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md">
          AI model settings saved successfully.
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-medium text-gray-900">Model Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose your preferred AI model provider and hosting type.
        </p>
        
        <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="preferredProvider"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred Provider
            </label>
            <select
              id="preferredProvider"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={preferredProvider}
              onChange={(e) => setPreferredProvider(e.target.value as ModelProviderType)}
            >
              {availableProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label
              htmlFor="preferredHosting"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred Hosting
            </label>
            <select
              id="preferredHosting"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={preferredHosting}
              onChange={(e) => setPreferredHosting(e.target.value as ModelHostingType)}
            >
              <option value={ModelHosting.CLOUD}>Cloud</option>
              <option value={ModelHosting.LOCAL}>Local</option>
              {userTier === 'premium' && (
                <option value={ModelHosting.CUSTOM}>Custom</option>
              )}
            </select>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add your API keys for different model providers. These keys are securely stored and used to access the AI models.
        </p>
        
        <div className="mt-4 space-y-4">
          {apiKeyNames.map((keyName) => (
            <div key={keyName}>
              <label
                htmlFor={keyName}
                className="block text-sm font-medium text-gray-700"
              >
                {keyName.replace('_API_KEY', '').charAt(0).toUpperCase() + 
                 keyName.replace('_API_KEY', '').slice(1).toLowerCase()} API Key
              </label>
              <input
                type="password"
                id={keyName}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={`Enter your ${keyName.replace('_API_KEY', '').toLowerCase()} API key`}
                value={apiKeys[keyName] || ''}
                onChange={(e) => handleApiKeyChange(keyName, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {userTier === 'premium' && (
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Custom Models</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add custom models with their own endpoints. This feature is available for premium users only.
          </p>
          
          <div className="p-4 mt-4 border border-gray-200 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Add New Custom Model</h3>
            
            <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="modelId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Model ID
                </label>
                <input
                  type="text"
                  id="modelId"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., my-custom-llama"
                  value={newCustomModel.id}
                  onChange={(e) => handleCustomModelChange('id', e.target.value)}
                />
              </div>
              
              <div>
                <label
                  htmlFor="modelName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="modelName"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., My Custom Llama"
                  value={newCustomModel.name}
                  onChange={(e) => handleCustomModelChange('name', e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label
                  htmlFor="baseUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Base URL
                </label>
                <input
                  type="text"
                  id="baseUrl"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., http://localhost:8000/v1"
                  value={newCustomModel.baseUrl}
                  onChange={(e) => handleCustomModelChange('baseUrl', e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddCustomModel}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Custom Model
              </button>
            </div>
          </div>
          
          {customModels.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Your Custom Models</h3>
              
              <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                {customModels.map((model) => (
                  <li key={model.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.id}</p>
                      <p className="text-xs text-gray-500">{model.baseUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomModel(model.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 mr-2 -ml-1 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}
