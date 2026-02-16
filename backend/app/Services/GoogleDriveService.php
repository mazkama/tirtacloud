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
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
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
        return $this->client->fetchAccessTokenWithAuthCode($code);
    }

    public function setAccessToken($token)
    {
        $this->client->setAccessToken($token);
    }

    public function getDriveService()
    {
        return new Drive($this->client);
    }

    public function refreshToken($refreshToken)
    {
        if ($this->client->isAccessTokenExpired()) {
            $this->client->fetchAccessTokenWithRefreshToken($refreshToken);
            return $this->client->getAccessToken();
        }
        return $this->client->getAccessToken();
    }

    /**
     * Create a folder in Google Drive.
     * Used to create the system root folder "TirtaCloud" on account link.
     */
    public function createFolder(string $folderName, string $parentId = null): \Google\Service\Drive\DriveFile
    {
        $service = $this->getDriveService();
        
        $folderMetadata = new \Google\Service\Drive\DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
        ]);

        if ($parentId) {
            $folderMetadata->setParents([$parentId]);
        }

        return $service->files->create($folderMetadata, [
            'fields' => 'id, name'
        ]);
    }

    /**
     * Find an existing folder by name in Google Drive root.
     */
    public function findFolder(string $folderName, string $parentId = null): ?string
    {
        $service = $this->getDriveService();
        $parent = $parentId ?: 'root';
        
        $result = $service->files->listFiles([
            'q' => "name = '{$folderName}' and mimeType = 'application/vnd.google-apps.folder' and '{$parent}' in parents and trashed = false",
            'fields' => 'files(id, name)',
            'pageSize' => 1,
        ]);

        $files = $result->getFiles();
        return count($files) > 0 ? $files[0]->getId() : null;
    }

    /**
     * Upload file to Google Drive — always into the specified folder
     */
    public function uploadFile($file, $folderId = null)
    {
        $service = $this->getDriveService();
        
        $parents = $folderId ? [$folderId] : [];
        
        $fileMetadata = new \Google\Service\Drive\DriveFile([
            'name' => $file->getClientOriginalName(),
            'parents' => $parents,
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

    public function getFileContent($fileId)
    {
        $service = $this->getDriveService();
        $response = $service->files->get($fileId, ['alt' => 'media']);
        return $response->getBody()->getContents();
    }
}
