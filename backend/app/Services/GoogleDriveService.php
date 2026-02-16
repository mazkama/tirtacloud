<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use App\Models\UserCloudAccount;

class GoogleDriveService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));
        $this->client->setAccessType('offline'); // Critical for refresh tokens
        $this->client->setPrompt('consent'); // Force consent to get refresh token
        $this->client->addScope(Drive::DRIVE);
        $this->client->addScope(Drive::DRIVE_METADATA_READONLY);
        $this->client->addScope('email');
        $this->client->addScope('profile');
        $this->client->addScope('openid');
    }

    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    public function handleCallback($code)
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);
        return $token;
    }

    public function setAccessToken($token)
    {
        $this->client->setAccessToken($token);
    }

    public function getDriveService()
    {
        return new Drive($this->client);
    }

    public function listFiles($folderId = null)
    {
        $service = $this->getDriveService();
        $optParams = [
            'pageSize' => 100,
            'fields' => 'nextPageToken, files(id, name, mimeType, size, parents, webViewLink, webContentLink)',
            'q' => $folderId ? "'$folderId' in parents and trashed = false" : "'root' in parents and trashed = false"
        ];
        
        return $service->files->listFiles($optParams);
    }
    
    public function getUserInfo()
    {
        $oauth2 = new \Google\Service\Oauth2($this->client);
        return $oauth2->userinfo->get();
    }
    
    public function getStorageQuota()
    {
        $service = $this->getDriveService();
        return $service->about->get(['fields' => 'storageQuota'])->getStorageQuota();
    }

    public function refreshToken($refreshToken)
    {
        if ($this->client->isAccessTokenExpired()) {
            $this->client->fetchAccessTokenWithRefreshToken($refreshToken);
            
            // Should return array with access_token etc.
            return $this->client->getAccessToken();
        }
        return $this->client->getAccessToken();
    }

    public function uploadFile($file, $folderId = null)
    {
        $service = $this->getDriveService();
        $fileMetadata = new \Google\Service\Drive\DriveFile([
            'name' => $file->getClientOriginalName(),
            'parents' => $folderId ? [$folderId] : []
        ]);
        
        $content = file_get_contents($file->getRealPath());

        return $service->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $file->getClientMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id, name, mimeType, size, webViewLink, webContentLink'
        ]);
    }

    public function deleteFile($fileId)
    {
        $service = $this->getDriveService();
        try {
            $service->files->delete($fileId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getFileDetails($fileId)
    {
        $service = $this->getDriveService();
        return $service->files->get($fileId, ['fields' => 'id, name, mimeType, size, webViewLink, webContentLink']);
    }
}
