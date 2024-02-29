namespace DrawGuessQuest.Server.Models
{
    public class DrawnLine
    {
        public string Color { get; set; }
        public int Width { get; set; }
        public bool IsFinished { get; set; }
        public List<Point> Points { get; set; }
    }
}
