namespace DrawGuessQuest.Server.Models
{
    public class PlayerInfo
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public int Score { get; set; } = 0;
    }
}
