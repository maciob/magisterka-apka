using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using System.Threading.Tasks;

public interface ISecretsManagerService
{
    Task CreateSecret(string secretName, string secretValue);
    Task<string> GetSecret(string secretName);
    Task UpdateSecret(string secretName, string newSecretValue);
    Task DeleteSecret(string secretName);
}

public class SecretsManagerService : ISecretsManagerService
{
    private AmazonSecretsManagerClient client;

    public SecretsManagerService()
    {
        client = new AmazonSecretsManagerClient(RegionEndpoint.EUWest1);
    }

    public async Task CreateSecret(string secretName, string secretValue)
    {
        var request = new CreateSecretRequest
        {
            Name = secretName,
            SecretString = secretValue,
            Description = "PasswordManagerSecret"
        };
        await client.CreateSecretAsync(request);
    }

    public async Task<string> GetSecret(string secretName)
    {
        var request = new GetSecretValueRequest
        {
            SecretId = secretName
        };
        var response = await client.GetSecretValueAsync(request);
        return response.SecretString;
    }

    public async Task UpdateSecret(string secretName, string newSecretValue)
    {
        var request = new UpdateSecretRequest
        {
            SecretId = secretName,
            SecretString = newSecretValue
        };
        await client.UpdateSecretAsync(request);
    }

    public async Task DeleteSecret(string secretName)
    {
        var request = new DeleteSecretRequest
        {
            SecretId = secretName,
            ForceDeleteWithoutRecovery = true
        };
        await client.DeleteSecretAsync(request);
    }
}
